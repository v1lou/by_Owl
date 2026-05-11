import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const row = await prisma.siteConfig.findUnique({ where: { key: 'socials' } });
  return NextResponse.json(row ? JSON.parse(row.value) : {});
}