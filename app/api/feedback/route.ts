import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST — новое сообщение (доступно всем)
export async function POST(req: Request) {
  try {
    const { name, email, message } = await req.json();

    if (!name?.trim() || !message?.trim()) {
      return NextResponse.json(
        { error: 'Имя и сообщение обязательны' },
        { status: 400 }
      );
    }

    const feedback = await prisma.feedback.create({
      data: {
        name: name.trim(),
        email: email?.trim() || null,
        message: message.trim(),
      }
    });

    return NextResponse.json({ success: true, id: feedback.id });
  } catch (error) {
    console.error('Feedback error:', error);
    return NextResponse.json(
      { error: 'Ошибка при сохранении' },
      { status: 500 }
    );
  }
}

// GET — получить активные сообщения (только для админа)
export async function GET(req: NextRequest) {
  // Получаем сессию через fetch вместо getToken
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
    return NextResponse.json(
      { error: 'Доступ запрещён' },
      { status: 401 }
    );
  }

  // ИСПРАВЛЕНО: добавлен фильтр deletedAt: null
  const feedback = await prisma.feedback.findMany({
    where: { 
      deletedAt: null  // ← только не удалённые (активные)
    },
    orderBy: { createdAt: 'desc' }
  });

  return NextResponse.json({ feedback });
}