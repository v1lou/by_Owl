import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  // Получаем сессию через fetch
  const baseUrl = process.env.NEXTAUTH_URL || `http://localhost:3000`;
  
  const sessionRes = await fetch(`${baseUrl}/api/auth/session`, {
    headers: {
      cookie: req.headers.get('cookie') || '',
    },
  });
  
  const session = await sessionRes.json();
  const email = session?.user?.email;
  
  const allowedAdmins = process.env.ALLOWED_ADMINS?.split(',') || [];
  const isAdmin = email ? allowedAdmins.includes(email) : false;

  if (!isAdmin) {
    return NextResponse.json({ error: 'Доступ запрещён' }, { status: 401 });
  }

  try {
    const { id } = await req.json();

    await prisma.feedback.update({
      where: { id },
      data: { read: true }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Ошибка' }, { status: 500 });
  }
}