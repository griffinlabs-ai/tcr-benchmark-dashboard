import { NextRequest, NextResponse } from 'next/server';

// Gate the whole dashboard behind a single shared password (HTTP Basic auth).
// The ingest endpoint is intentionally excluded here because it uses its own
// bearer-token check (robots cannot do interactive Basic auth).
export function middleware(req: NextRequest): NextResponse {
  const expected = process.env.VIEWER_PASSWORD;
  // If no password is configured, do not lock anyone out (e.g. local dev).
  if (!expected) return NextResponse.next();

  const auth = req.headers.get('authorization') || '';
  if (auth.startsWith('Basic ')) {
    try {
      const decoded = atob(auth.slice(6));
      const password = decoded.slice(decoded.indexOf(':') + 1);
      if (password === expected) return NextResponse.next();
    } catch {
      /* fall through to challenge */
    }
  }
  return new NextResponse('Authentication required', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="Frontier Benchmark"' },
  });
}

export const config = {
  // Gate everything except the token-authed machine APIs and Next internals.
  matcher: ['/((?!api/ingest|api/admin|_next/static|_next/image|favicon.ico).*)'],
};
