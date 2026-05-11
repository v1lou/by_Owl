// app/api/owl-chat/admin-status/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    
    const allowedAdmins = process.env.ALLOWED_ADMINS?.split(',') || [];
    const isAdmin = email ? allowedAdmins.includes(email) : false;
    
    return NextResponse.json({ isAdmin });
    
  } catch (error) {
    return NextResponse.json({ isAdmin: false });
  }
}