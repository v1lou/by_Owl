import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/checkAdmin';

// Переместить в корзину
export async function POST(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await req.json();

  try {
    await prisma.feedback.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Trash error:', error);
    return NextResponse.json({ error: 'Ошибка при перемещении в корзину' }, { status: 500 });
  }
}

// Получить корзину
export async function GET(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const items = await prisma.feedback.findMany({
      where: { deletedAt: { not: null } },
      orderBy: { deletedAt: 'desc' }
    });
    return NextResponse.json(items);
  } catch (error) {
    console.error('Get trash error:', error);
    return NextResponse.json({ error: 'Ошибка при получении корзины' }, { status: 500 });
  }
}