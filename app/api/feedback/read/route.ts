import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/checkAdmin';

export async function POST(req: NextRequest) {

  const err = await requireAdmin('feedback');
  if (err) return err;

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