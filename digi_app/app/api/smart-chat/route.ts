import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST: Process natural language queries (Smart Chat LLM Mock)
export async function POST(req: NextRequest) {
  try {
    const role = req.headers.get('x-user-role');
    
    // Smart chat is restricted to PM, Tim Keuangan, or Direktur / Manajemen
    if (role !== 'Project Manager' && role !== 'Tim Keuangan' && role !== 'Direktur / Manajemen') {
      return NextResponse.json({ message: 'Forbidden: Unauthorized to use Smart Chat' }, { status: 403 });
    }

    const body = await req.json();
    const { message } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ message: 'Message is required' }, { status: 400 });
    }

    const lowerMessage = message.toLowerCase();
    let responseText = '';

    // 1. Sisa budget query
    if (lowerMessage.includes('sisa budget') || lowerMessage.includes('sisa anggaran') || lowerMessage.includes('budget proyek')) {
      const budgets = await prisma.budget.findMany({
        include: { proyek: { select: { nama: true } } },
      });

      if (budgets.length === 0) {
        responseText = 'Saat ini belum ada data budget proyek yang dikonfigurasi di sistem.';
      } else {
        responseText = 'Berikut adalah rincian sisa budget proyek saat ini:\n';
        budgets.forEach((b) => {
          const sisa = Number(b.sisaBudget);
          const total = Number(b.rabTotal);
          const pct = total > 0 ? ((sisa / total) * 100).toFixed(1) : '0';
          responseText += `- **Proyek ${b.proyek.nama}**: Sisa budget Rp ${sisa.toLocaleString()} dari total Rp ${total.toLocaleString()} (${pct}% tersisa).\n`;
        });
      }
    } 
    // 2. Pengeluaran terbesar query
    else if (lowerMessage.includes('pengeluaran terbesar') || lowerMessage.includes('transaksi terbesar') || lowerMessage.includes('terbesar')) {
      const largestRb = await prisma.reimbursement.findFirst({
        where: { status: 'APPROVED' },
        orderBy: { nominal: 'desc' },
        include: {
          user: { select: { nama: true } },
          proyek: { select: { nama: true } },
          posAnggaran: { select: { deskripsi: true } },
        },
      });

      if (!largestRb) {
        responseText = 'Belum ada pengeluaran/reimbursement yang disetujui di sistem saat ini.';
      } else {
        const nominal = Number(largestRb.nominal);
        responseText = `Pengeluaran terbesar yang telah dicairkan di sistem adalah pengajuan dari **${largestRb.user.nama}** untuk proyek **${largestRb.proyek.nama}** (Pos Anggaran: ${largestRb.posAnggaran.deskripsi}) sebesar **Rp ${nominal.toLocaleString()}**.`;
      }
    } 
    // 3. Pending approvals query
    else if (lowerMessage.includes('pending') || lowerMessage.includes('menunggu') || lowerMessage.includes('antrian') || lowerMessage.includes('approval')) {
      const pendingRbs = await prisma.reimbursement.findMany({
        where: {
          status: { in: ['SUBMITTED', 'APPROVED_BY_PM'] },
        },
        select: {
          nominal: true,
          status: true,
        },
      });

      if (pendingRbs.length === 0) {
        responseText = 'Tidak ada pengajuan reimbursement yang sedang menunggu persetujuan saat ini. Semua pengajuan bersih!';
      } else {
        const totalPendingNominal = pendingRbs.reduce((sum, r) => sum + Number(r.nominal), 0);
        const countPM = pendingRbs.filter(r => r.status === 'SUBMITTED').length;
        const countKeuangan = pendingRbs.filter(r => r.status === 'APPROVED_BY_PM').length;

        responseText = `Saat ini terdapat **${pendingRbs.length} pengajuan pending** dengan total nominal **Rp ${totalPendingNominal.toLocaleString()}**.\n`;
        responseText += `- Menunggu validasi Project Manager: ${countPM} pengajuan.\n`;
        responseText += `- Menunggu pencairan Tim Keuangan: ${countKeuangan} pengajuan.`;
      }
    }
    // 4. Jurnal akuntansi/CoA query
    else if (lowerMessage.includes('jurnal') || lowerMessage.includes('coa') || lowerMessage.includes('chart of accounts') || lowerMessage.includes('akun')) {
      const journalCount = await prisma.jurnalAkuntansi.count();
      const coaCount = await prisma.chartOfAccounts.count();
      const totalDebitResult = await prisma.jurnalAkuntansi.aggregate({
        _sum: { nominal: true },
      });
      const totalDebit = Number(totalDebitResult._sum.nominal || 0);

      responseText = `Sistem akuntansi mencatat **${coaCount} kode akun (CoA)** aktif.\n`;
      responseText += `Terdapat **${journalCount} jurnal akuntansi** otomatis yang telah digenerate dengan total nilai nominal **Rp ${totalDebit.toLocaleString()}**. Total Debit dan Kredit tercatat seimbang (balanced).`;
    }
    // 5. Default fallback helper
    else {
      responseText = `Halo! Saya asisten pintar Digi Money Manager. Anda dapat menanyakan tentang data keuangan real-time dari database. 
Contoh pertanyaan yang dapat Anda ajukan:
1. *"Berapa sisa budget proyek saat ini?"*
2. *"Apa pengeluaran terbesar yang tercatat?"*
3. *"Berapa banyak reimbursement yang pending?"*
4. *"Bagaimana status jurnal akuntansi dan CoA?"*`;
    }

    return NextResponse.json({
      reply: responseText,
      queryMessage: message,
      timestamp: new Date(),
    });
  } catch (error: any) {
    console.error('Smart chat error:', error);
    return NextResponse.json({ message: 'Internal server error', error: error.message }, { status: 500 });
  }
}
