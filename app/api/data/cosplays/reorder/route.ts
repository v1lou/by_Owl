import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/checkAdmin';

export async function POST(req: Request) {
  const err = await requireAdmin('cosplay');
  if (err) return err;

  try {
    const { ids } = await req.json();

    await Promise.all(
      ids.map((id: number, index: number) =>
        prisma.cosplay.update({
          where: { id },
          data: { order: index },
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Reorder error:', error);
    return NextResponse.json({ error: 'Ошибка сохранения порядка' }, { status: 500 });
  }
}