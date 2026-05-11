import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const sessionRes = await fetch(`${baseUrl}/api/auth/session`, {
    headers: { cookie: req.headers.get('cookie') || '' },
  });
  const session = await sessionRes.json();
  const email = session?.user?.email;

  if (!email) return NextResponse.json({ isAdmin: false, role: null, permissions: [] });

  const ownerEmails = process.env.OWNER_EMAILS?.split(',') || [];
  if (ownerEmails.includes(email)) {
    return NextResponse.json({ isAdmin: true, role: 'owner', permissions: ['all'] });
  }

  const { PrismaClient } = await import('@prisma/client');
  const prisma = new PrismaClient();
  const adminUser = await prisma.adminUser.findUnique({ where: { email } });

  if (!adminUser) return NextResponse.json({ isAdmin: false, role: null, permissions: [] });

  return NextResponse.json({
    isAdmin: true,
    role: adminUser.role,
    permissions: JSON.parse(adminUser.permissions),
  });
}