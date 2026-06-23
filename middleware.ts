import { NextRequest, NextResponse } from 'next/server';

import { AUTH_COOKIE, sha256Hex } from '@/lib/auth';

// Gate the whole dashboard behind a single shared password via a cookie set by
// the /login page. The ingest endpoint is excluded (it uses its own bearer
// token), and /login + /api/login must stay reachable while signed out.
export async function middleware(req: NextRequest): Promise<NextResponse> {
  const expected = process.env.VIEWER_PASSWORD;
  // If no password is configured, do not lock anyone out (e.g. local dev).
  if (!expected) return NextResponse.next();

  const token = req.cookies.get(AUTH_COOKIE)?.value;
  const want = await sha256Hex(expected);
  if (token && token === want) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = '/login';
  url.search = '';
  url.searchParams.set('next', req.nextUrl.pathname + req.nextUrl.search);
  return NextResponse.redirect(url);
}

export const config = {
  // Gate everything except the token-authed ingest API, the login route/page,
  // and Next internals.
  matcher: ['/((?!api/ingest|api/login|login|_next/static|_next/image|favicon.ico).*)'],
};
