import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';

// GET: List all members (users) with their project assignments
export async function GET(req: NextRequest) {
  try {
    const role = req.headers.get('x-user-role');

    if (role !== 'Direktur / Manajemen') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        nama: true,
        email: true,
        role: true,
        divisi: true,
        proyek: {
          include: {
            proyek: {
              select: { id: true, nama: true, status: true },
            },
          },
        },
      },
      orderBy: { id: 'desc' },
    });

    const mapped = users.map((u) => ({
      id: u.id,
      nama: u.nama,
      email: u.email,
      role: u.role,
      divisi: u.divisi,
      proyek: u.proyek.map((up) => ({
        id: up.proyek.id,
        nama: up.proyek.nama,
        status: up.proyek.status,
        roleInProyek: up.role,
      })),
    }));

    return NextResponse.json({ members: mapped });
  } catch (error: any) {
    console.error('Get members error:', error);
    return NextResponse.json({ message: 'Internal server error', error: error.message }, { status: 500 });
  }
}

// POST: Register a new member
export async function POST(req: NextRequest) {
  try {
    const role = req.headers.get('x-user-role');

    if (role !== 'Direktur / Manajemen') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { nama, email, password, userRole, divisi, proyekId } = body;

    if (!nama || !email || !password || !userRole) {
      return NextResponse.json({ message: 'Nama, email, password, dan role wajib diisi' }, { status: 400 });
    }

    const trimmedEmail = String(email).trim().toLowerCase();

    const existing = await prisma.user.findUnique({ where: { email: trimmedEmail } });
    if (existing) {
      return NextResponse.json({ message: 'Email sudah terdaftar' }, { status: 400 });
    }

    const hashedPassword = await hashPassword(password);

    const newUser = await prisma.user.create({
      data: {
        nama,
        email: trimmedEmail,
        passwordHash: hashedPassword,
        role: userRole,
        divisi: divisi || null,
      },
    });

    // Associate with project if proyekId is given
    if (proyekId) {
      await prisma.userProyek.create({
        data: {
          userId: newUser.id,
          proyekId: parseInt(proyekId, 10),
          role: userRole === 'Project Manager' ? 'Project Manager' : 'Anggota Lapangan',
        },
      });
    }

    // Audit trail
    const direktorId = req.headers.get('x-user-id');
    if (direktorId) {
      await prisma.auditTrail.create({
        data: {
          userId: parseInt(direktorId, 10),
          aksi: 'register_member',
          detail: `Direktur mendaftarkan anggota baru: ${nama} (${userRole})`,
        },
      });
    }

    const { passwordHash: _, ...userWithoutPassword } = newUser;
    return NextResponse.json({ message: 'Anggota berhasil didaftarkan', user: userWithoutPassword }, { status: 201 });
  } catch (error: any) {
    console.error('Register member error:', error);
    return NextResponse.json({ message: 'Internal server error', error: error.message }, { status: 500 });
  }
}
