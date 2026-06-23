import { NextRequest, NextResponse } from 'next/server';

import { AUTH_COOKIE, AUTH_MAX_AGE, sha256Hex } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const expected = process.env.VIEWER_PASSWORD;
  // No gate configured: accept anything (mirrors middleware's open behavior).
  if (!expected) return NextResponse.json({ ok: true });

  let password = '';
  try {
    const body = await req.json();
    password = String(body?.password ?? '');
  } catch {
    /* fall through to unauthorized */
  }

  if (password !== expected) {
    return NextResponse.json({ ok: false, error: 'invalid password' }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(AUTH_COOKIE, await sha256Hex(expected), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: AUTH_MAX_AGE,
  });
  return res;
}
