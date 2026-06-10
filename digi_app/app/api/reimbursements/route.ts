import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { promises as fs } from 'fs';
import path from 'path';

// Helper to generate unique filenames
const generateRandomFilename = (originalName: string) => {
  const ext = path.extname(originalName) || '.png';
  const randomStr = Math.random().toString(36).substring(2, 15);
  return `${Date.now()}-${randomStr}${ext}`;
};

// GET: Fetch reimbursement lists based on user role
export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    const role = req.headers.get('x-user-role');
    const userProyekId = req.headers.get('x-user-proyek-id');

    if (!userId || !role) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    let filter: any = {};

    if (role === 'Karyawan') {
      // Employees only see their own submissions
      filter.userId = userId;
    } else if (role === 'Project Manager') {
      // PMs see submissions belonging to their assigned project
      if (userProyekId) {
        filter.proyekId = userProyekId;
      } else {
        // If PM is not assigned to a project, they see nothing or their own
        return NextResponse.json({ reimbursements: [] });
      }
    }
    // Tim Keuangan and Direktur / Manajemen see all records (no filter)

    const reimbursements = await prisma.reimbursement.findMany({
      where: filter,
      include: {
        user: {
          select: {
            id: true,
            nama: true,
            email: true,
            role: true,
            divisi: true,
          },
        },
        proyek: true,
        posAnggaran: true,
        approvals: {
          include: {
            approver: {
              select: { nama: true, role: true },
            },
          },
          orderBy: { timestamp: 'desc' },
        },
      },
      orderBy: { id: 'desc' },
    });

    return NextResponse.json({ reimbursements });
  } catch (error: any) {
    console.error('Fetch reimbursements error:', error);
    return NextResponse.json({ message: 'Internal server error', error: error.message }, { status: 500 });
  }
}

// POST: Submit a reimbursement (Supports both multipart/form-data and raw JSON)
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    const role = req.headers.get('x-user-role');

    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    let proyekId = '';
    let posAnggaranId = '';
    let nominal = 0;
    let strukUrl = '';
    let ocrData: any = {};

    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      proyekId = formData.get('proyekId') as string;
      posAnggaranId = formData.get('posAnggaranId') as string;
      nominal = parseFloat(formData.get('nominal') as string);
      
      const ocrDataStr = formData.get('ocrData') as string;
      if (ocrDataStr) {
        try {
          ocrData = JSON.parse(ocrDataStr);
        } catch (e) {
          ocrData = { raw: ocrDataStr };
        }
      }

      // Handle file upload
      const file = formData.get('file') as File | null;
      if (file) {
        const uploadDir = path.join(process.cwd(), 'public', 'uploads');
        // Ensure upload directory exists
        await fs.mkdir(uploadDir, { recursive: true });
        
        const filename = generateRandomFilename(file.name);
        const filePath = path.join(uploadDir, filename);
        const buffer = Buffer.from(await file.arrayBuffer());
        await fs.writeFile(filePath, buffer);
        strukUrl = `/uploads/${filename}`;
      } else {
        strukUrl = formData.get('strukUrl') as string || '/uploads/placeholder.png';
      }
    } else {
      // Parse as standard JSON
      const body = await req.json();
      proyekId = body.proyekId;
      posAnggaranId = body.posAnggaranId;
      nominal = parseFloat(body.nominal);
      strukUrl = body.strukUrl || '/uploads/placeholder.png';
      ocrData = body.ocrData || {};
    }

    if (!proyekId || !posAnggaranId || isNaN(nominal) || nominal <= 0) {
      return NextResponse.json({ message: 'proyekId, posAnggaranId, and a positive nominal are required' }, { status: 400 });
    }

    // Verify project and budget category existence
    const pos = await prisma.posAnggaran.findUnique({
      where: { id: posAnggaranId },
      include: {
        budget: true,
      },
    });

    if (!pos || pos.budget.proyekId !== proyekId) {
      return NextResponse.json({ message: 'Invalid Pos Anggaran or Proyek match' }, { status: 400 });
    }

    // Create Reimbursement record in SUBMITTED state
    const reimbursement = await prisma.reimbursement.create({
      data: {
        userId,
        proyekId,
        posAnggaranId,
        nominal,
        strukUrl,
        ocrData,
        status: 'SUBMITTED',
      },
      include: {
        user: { select: { nama: true } },
        proyek: { select: { nama: true } },
      },
    });

    // Create Audit Trail
    await prisma.auditTrail.create({
      data: {
        userId,
        aksi: 'submit_reimbursement',
        detail: `Mengajukan reimbursement Rp ${nominal.toLocaleString()} untuk proyek ${reimbursement.proyek.nama}`,
      },
    });

    // Create notification for the Project Manager of the project (if any)
    const pmUsers = await prisma.user.findMany({
      where: {
        proyekId,
        role: 'Project Manager',
      },
    });

    for (const pm of pmUsers) {
      await prisma.notification.create({
        data: {
          userId: pm.id,
          tipe: 'approval_request',
          pesan: `Pengajuan reimbursement baru dari ${reimbursement.user.nama} senilai Rp ${nominal.toLocaleString()} menunggu validasi Anda.`,
        },
      });
    }

    return NextResponse.json({ 
      message: 'Reimbursement submitted successfully', 
      reimbursement 
    }, { status: 201 });
  } catch (error: any) {
    console.error('Submit reimbursement error:', error);
    return NextResponse.json({ message: 'Internal server error', error: error.message }, { status: 500 });
  }
}
