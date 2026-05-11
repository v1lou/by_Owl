import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const PERMISSIONS = ['feedback', 'suggestions', 'analytics', 'archive', 'streams', 'merch', 'cosplay', 'config'];

async function getCallerRole(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;
  const ownerEmails = process.env.OWNER_EMAILS?.split(',') || [];
  if (ownerEmails.includes(session.user.email)) return { role: 'owner', email: session.user.email };
  const user = await prisma.adminUser.findUnique({ where: { email: session.user.email } });
  if (!user) return null;
  return { role: user.role, email: session.user.email };
}

// GET — список всех пользователей
export async function GET(req: NextRequest) {
  const caller = await getCallerRole(req);
  if (!caller || !['owner', 'editor'].includes(caller.role)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  const users = await prisma.adminUser.findMany({ orderBy: { createdAt: 'desc' } });
  return NextResponse.json({ success: true, data: users });
}

// POST — добавить пользователя (только owner)
export async function POST(req: NextRequest) {
  const caller = await getCallerRole(req);
  if (!caller || caller.role !== 'owner') {
    return NextResponse.json({ success: false, error: 'Only owner can add users' }, { status: 403 });
  }
  const { email, role, permissions } = await req.json();
  if (!email || !role) return NextResponse.json({ success: false, error: 'email and role required' }, { status: 400 });
  const validPerms = (permissions || []).filter((p: string) => PERMISSIONS.includes(p));
  const user = await prisma.adminUser.upsert({
    where: { email },
    update: { role, permissions: JSON.stringify(validPerms), invitedBy: caller.email },
    create: { email, role, permissions: JSON.stringify(validPerms), invitedBy: caller.email },
  });
  return NextResponse.json({ success: true, data: user });
}

// PATCH — обновить роль/права
export async function PATCH(req: NextRequest) {
  const caller = await getCallerRole(req);
  if (!caller || caller.role !== 'owner') {
    return NextResponse.json({ success: false, error: 'Only owner can edit users' }, { status: 403 });
  }
  const { id, role, permissions } = await req.json();
  if (!id) return NextResponse.json({ success: false, error: 'id required' }, { status: 400 });
  const validPerms = permissions ? (permissions as string[]).filter(p => PERMISSIONS.includes(p)) : undefined;
  const updated = await prisma.adminUser.update({
    where: { id },
    data: {
      ...(role && { role }),
      ...(validPerms !== undefined && { permissions: JSON.stringify(validPerms) }),
    },
  });
  return NextResponse.json({ success: true, data: updated });
}

// DELETE — удалить пользователя
export async function DELETE(req: NextRequest) {
  const caller = await getCallerRole(req);
  if (!caller || caller.role !== 'owner') {
    return NextResponse.json({ success: false, error: 'Only owner can delete users' }, { status: 403 });
  }
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ success: false, error: 'id required' }, { status: 400 });
  await prisma.adminUser.delete({ where: { id } });
  return NextResponse.json({ success: true });
}