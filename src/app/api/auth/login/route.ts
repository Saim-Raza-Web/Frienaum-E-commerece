import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { signToken } from '@/lib/auth';
import { setAuthCookie } from '@/lib/cookies';

export async function POST(request: NextRequest) {
  const { email, password } = await request.json();

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });

  const token = signToken({ id: user.id, email: user.email, role: user.role });
  const response = NextResponse.json({ role: user.role, name: user.name });
  response.headers.set('Set-Cookie', setAuthCookie(token));

  return response;
}
