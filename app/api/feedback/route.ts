import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/checkAdmin';

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

export async function GET(req: NextRequest) {
  const err = await requireAdmin('feedback');
  if (err) return err;

  const feedback = await prisma.feedback.findMany({
    where: { 
      deletedAt: null
    },
    orderBy: { createdAt: 'desc' }
  });

  return NextResponse.json({ feedback });
}