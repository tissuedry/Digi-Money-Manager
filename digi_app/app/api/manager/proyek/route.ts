import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: List all projects (for dropdown in member registration form)
export async function GET(req: NextRequest) {
  try {
    const role = req.headers.get('x-user-role');

    if (role !== 'Direktur / Manajemen') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const proyekList = await prisma.proyek.findMany({
      select: {
        id: true,
        nama: true,
        status: true,
        tanggalMulai: true,
        tanggalSelesai: true,
      },
      orderBy: { id: 'desc' },
    });

    return NextResponse.json({ proyek: proyekList });
  } catch (error: any) {
    console.error('Get proyek error:', error);
    return NextResponse.json({ message: 'Internal server error', error: error.message }, { status: 500 });
  }
}
