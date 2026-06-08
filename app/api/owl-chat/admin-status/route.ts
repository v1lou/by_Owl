import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const email = session?.user?.email;
    if (!email) return NextResponse.json({ isAdmin: false });

    const ownerEmails = process.env.OWNER_EMAILS?.split(',') || [];
    if (ownerEmails.includes(email)) return NextResponse.json({ isAdmin: true });

    const dbUser = await prisma.adminUser.findUnique({ where: { email } });
    return NextResponse.json({ isAdmin: !!dbUser });
  } catch {
    return NextResponse.json({ isAdmin: false });
  }
}