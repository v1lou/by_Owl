import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const row = await prisma.siteConfig.findUnique({ where: { key: 'pc_config' } });
  return NextResponse.json(row ? JSON.parse(row.value) : {});
}