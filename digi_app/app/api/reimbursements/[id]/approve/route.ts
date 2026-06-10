import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST: Process reimbursement approval / rejection (PM and Keuangan)
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const role = req.headers.get('x-user-role');
    const userId = req.headers.get('x-user-id');

    if (!userId || !role) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { action, catatan, noAkunDebit, noAkunKredit } = body; // action is 'APPROVE' or 'REJECT'

    if (!action || (action !== 'APPROVE' && action !== 'REJECT')) {
      return NextResponse.json({ message: "Action must be 'APPROVE' or 'REJECT'" }, { status: 400 });
    }

    // 1. Fetch the reimbursement
    const reimbursement = await prisma.reimbursement.findUnique({
      where: { id },
      include: {
        user: { select: { nama: true, id: true } },
        proyek: { select: { nama: true, id: true } },
        posAnggaran: true,
      },
    });

    if (!reimbursement) {
      return NextResponse.json({ message: 'Reimbursement not found' }, { status: 404 });
    }

    const nominal = Number(reimbursement.nominal);

    // 2. Handle Project Manager (PM) level approval
    if (role === 'Project Manager') {
      if (reimbursement.status !== 'SUBMITTED') {
        return NextResponse.json({ message: 'Reimbursement is not pending PM approval' }, { status: 400 });
      }

      const nextStatus = action === 'APPROVE' ? 'APPROVED_BY_PM' : 'REJECTED';
      const actionText = action === 'APPROVE' ? 'menyetujui' : 'menolak';

      const updated = await prisma.$transaction(async (tx) => {
        // Create approval record
        await tx.approval.create({
          data: {
            reimbursementId: id,
            approverId: userId,
            level: 'PM',
            status: nextStatus,
            catatan: catatan || null,
          },
        });

        // Update reimbursement status
        const rb = await tx.reimbursement.update({
          where: { id },
          data: { status: nextStatus },
        });

        // Audit Trail
        await tx.auditTrail.create({
          data: {
            userId,
            aksi: action === 'APPROVE' ? 'approve_pm' : 'reject_pm',
            detail: `PM ${actionText} pengajuan reimbursement Rp ${nominal.toLocaleString()} oleh ${reimbursement.user.nama}`,
          },
        });

        // Notify Karyawan of status change
        await tx.notification.create({
          data: {
            userId: reimbursement.userId,
            tipe: 'status_update',
            pesan: `Pengajuan reimbursement Anda senilai Rp ${nominal.toLocaleString()} telah ${action === 'APPROVE' ? 'disetujui oleh PM' : 'ditolak oleh PM'}.`,
          },
        });

        // If approved by PM, notify Tim Keuangan
        if (action === 'APPROVE') {
          const keuanganUsers = await tx.user.findMany({
            where: { role: 'Tim Keuangan' },
          });
          for (const finance of keuanganUsers) {
            await tx.notification.create({
              data: {
                userId: finance.id,
                tipe: 'approval_request',
                pesan: `Pengajuan reimbursement ${reimbursement.user.nama} (Proyek: ${reimbursement.proyek.nama}) disetujui PM, menunggu pencairan Keuangan.`,
              },
            });
          }
        }

        return rb;
      });

      return NextResponse.json({ message: `PM successfully processed approval: ${nextStatus}`, reimbursement: updated });
    }

    // 3. Handle Tim Keuangan level approval (Final Disbursement)
    if (role === 'Tim Keuangan') {
      if (reimbursement.status !== 'APPROVED_BY_PM') {
        return NextResponse.json({ message: 'Reimbursement is not pending Keuangan disbursement' }, { status: 400 });
      }

      if (action === 'APPROVE') {
        // Must provide accounting accounts for disbursement journal
        if (!noAkunDebit || !noAkunKredit) {
          return NextResponse.json({ message: 'noAkunDebit and noAkunKredit are required for disbursement journal' }, { status: 400 });
        }

        // Verify Chart of accounts exist
        const deb = await prisma.chartOfAccounts.findUnique({ where: { nomorAkun: noAkunDebit } });
        const kre = await prisma.chartOfAccounts.findUnique({ where: { nomorAkun: noAkunKredit } });

        if (!deb || !kre) {
          return NextResponse.json({ message: 'Invalid debit or credit account number' }, { status: 400 });
        }

        const result = await prisma.$transaction(async (tx) => {
          // A. Fetch current project budget
          const budget = await tx.budget.findUnique({
            where: { proyekId: reimbursement.proyekId },
          });

          if (!budget) {
            throw new Error(`Budget not configured for project ${reimbursement.proyek.nama}`);
          }

          const rabTotal = Number(budget.rabTotal);
          const prevSisa = Number(budget.sisaBudget);
          
          if (prevSisa < nominal) {
            // Wait, we can allow overdraft but let's throw warning or deduct anyway. Let's deduct anyway but send warning. Actually, budget deduction logic:
          }

          const newSisa = prevSisa - nominal;
          const newPengeluaran = Number(budget.totalPengeluaran) + nominal;
          const newReimbursementVal = Number(budget.totalReimbursement) + nominal;

          // B. Deduct project budget
          await tx.budget.update({
            where: { proyekId: reimbursement.proyekId },
            data: {
              sisaBudget: newSisa,
              totalPengeluaran: newPengeluaran,
              totalReimbursement: newReimbursementVal,
            },
          });

          // C. Update nominalTerpakai in PosAnggaran
          await tx.posAnggaran.update({
            where: { id: reimbursement.posAnggaranId },
            data: {
              nominalTerpakai: Number(reimbursement.posAnggaran.nominalTerpakai) + nominal,
            },
          });

          // D. Generate Jurnal Akuntansi (Debit-Kredit)
          const journal = await tx.jurnalAkuntansi.create({
            data: {
              reimbursementId: id,
              noAkunDebit,
              noAkunKredit,
              nominal,
              keterangan: `Pencairan reimbursement ${id} - ${reimbursement.user.nama} untuk ${reimbursement.posAnggaran.deskripsi}`,
            },
          });

          // E. Record Approval
          await tx.approval.create({
            data: {
              reimbursementId: id,
              approverId: userId,
              level: 'KEUANGAN',
              status: 'APPROVED',
              catatan: catatan || null,
            },
          });

          // F. Update status to APPROVED
          const rb = await tx.reimbursement.update({
            where: { id },
            data: { status: 'APPROVED' },
          });

          // G. Audit Trail
          await tx.auditTrail.create({
            data: {
              userId,
              aksi: 'approve_keuangan',
              detail: `Pencairan reimbursement Rp ${nominal.toLocaleString()} oleh ${reimbursement.user.nama}. Jurnal Debit: ${noAkunDebit}, Kredit: ${noAkunKredit}`,
            },
          });

          // H. Notify Karyawan of disbursement
          await tx.notification.create({
            data: {
              userId: reimbursement.userId,
              tipe: 'status_update',
              pesan: `Pengajuan reimbursement Anda senilai Rp ${nominal.toLocaleString()} telah DICAIRKAN oleh Tim Keuangan.`,
            },
          });

          // I. Budget threshold check (50%, 25%, 10%, 5%, 0% remaining)
          const prevPercentage = (prevSisa / rabTotal) * 100;
          const newPercentage = (newSisa / rabTotal) * 100;

          const thresholds = [50, 25, 10, 5, 0];
          for (const T of thresholds) {
            // If the sisa budget crossed a threshold
            if (prevPercentage > T && newPercentage <= T) {
              const alertMsg = `PERINGATAN BUDGET: Sisa budget proyek ${reimbursement.proyek.nama} telah mencapai batas/kurang dari ${T}% (Sisa: Rp ${newSisa.toLocaleString()})`;
              
              // 1. Notify PM of the project
              const pmUsers = await tx.user.findMany({
                where: { proyekId: reimbursement.proyekId, role: 'Project Manager' },
              });
              for (const pm of pmUsers) {
                await tx.notification.create({
                  data: {
                    userId: pm.id,
                    tipe: 'alert',
                    pesan: alertMsg,
                  },
                });
              }

              // 2. Notify all Keuangan
              const keuanganUsers = await tx.user.findMany({
                where: { role: 'Tim Keuangan' },
              });
              for (const finance of keuanganUsers) {
                await tx.notification.create({
                  data: {
                    userId: finance.id,
                    tipe: 'alert',
                    pesan: alertMsg,
                  },
                });
              }
            }
          }

          return { rb, journal };
        });

        return NextResponse.json({ 
          message: 'Reimbursement successfully disbursed and journal entries generated.', 
          reimbursement: result.rb,
          journal: result.journal 
        });
      } else {
        // Keuangan Rejects
        const updated = await prisma.$transaction(async (tx) => {
          await tx.approval.create({
            data: {
              reimbursementId: id,
              approverId: userId,
              level: 'KEUANGAN',
              status: 'REJECTED',
              catatan: catatan || null,
            },
          });

          const rb = await tx.reimbursement.update({
            where: { id },
            data: { status: 'REJECTED' },
          });

          await tx.auditTrail.create({
            data: {
              userId,
              aksi: 'reject_keuangan',
              detail: `Keuangan menolak pengajuan reimbursement Rp ${nominal.toLocaleString()} oleh ${reimbursement.user.nama}`,
            },
          });

          await tx.notification.create({
            data: {
              userId: reimbursement.userId,
              tipe: 'status_update',
              pesan: `Pengajuan reimbursement Anda senilai Rp ${nominal.toLocaleString()} ditolak oleh Tim Keuangan.`,
            },
          });

          return rb;
        });

        return NextResponse.json({ message: 'Reimbursement successfully rejected by Keuangan.', reimbursement: updated });
      }
    }

    return NextResponse.json({ message: 'Forbidden: Unauthorized role for approval' }, { status: 403 });
  } catch (error: any) {
    console.error('Approve reimbursement error:', error);
    return NextResponse.json({ message: 'Internal server error', error: error.message }, { status: 500 });
  }
}
