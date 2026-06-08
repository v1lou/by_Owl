import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/checkAdmin';

export async function POST(req: NextRequest) {
  const denied = await requireAdmin('feedback');
  if (denied) return denied;

  const { id, all } = await req.json();

  try {
    if (all) {
      await prisma.feedback.updateMany({
        where: { deletedAt: { not: null } },
        data: { deletedAt: null }
      });
    } else {
      await prisma.feedback.update({
        where: { id },
        data: { deletedAt: null }
      });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Restore error:', error);
    return NextResponse.json({ error: 'Ошибка при восстановлении' }, { status: 500 });
  }
}