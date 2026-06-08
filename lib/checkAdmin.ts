import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function requireAdmin(requiredPermission?: string) {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  if (!email) return NextResponse.json({ error: 'Нет доступа' }, { status: 401 });

  const ownerEmails = process.env.OWNER_EMAILS?.split(',') || [];
  if (ownerEmails.includes(email)) return null;

  const user = await prisma.adminUser.findUnique({ where: { email } });
  if (!user) return NextResponse.json({ error: 'Нет доступа' }, { status: 401 });

  if (requiredPermission) {
    const perms: string[] = JSON.parse(user.permissions || '[]');
    if (!perms.includes(requiredPermission)) {
      return NextResponse.json({ error: 'Недостаточно прав' }, { status: 403 });
    }
  }

  return null;
}