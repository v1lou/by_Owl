import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { requireAdmin } from '@/lib/checkAdmin';

async function isAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return false;
  const allowed = [
    ...(process.env.ALLOWED_ADMINS?.split(',') || []),
    ...(process.env.OWNER_EMAILS?.split(',') || []),
  ];
  return allowed.includes(session.user.email);
}

export async function POST(req: Request) {
  const err = await requireAdmin('cosplay');
  if (err) return err;
  try {
    const { ids } = await req.json();

    await Promise.all(
      ids.map((id: number, index: number) =>
        prisma.achievement.update({
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