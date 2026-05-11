// lib/checkAdmin.ts
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { NextResponse } from 'next/server';

export async function requireAdmin() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  const allowed = process.env.ALLOWED_ADMINS?.split(',') || [];
  
  if (!email || !allowed.includes(email)) {
    return NextResponse.json({ error: 'Нет доступа' }, { status: 401 });
  }
  return null; // null = всё ок, доступ разрешён
}

// Альтернативная функция, если нужно просто проверить без возврата Response
export async function isAdmin(): Promise<boolean> {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  const allowed = process.env.ALLOWED_ADMINS?.split(',') || [];
  return email ? allowed.includes(email) : false;
}