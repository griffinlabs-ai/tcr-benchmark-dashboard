import { NextRequest, NextResponse } from 'next/server';

import { getAssetUrl } from '@/lib/store';

// Streams a blob artifact (e.g. a run's map.png) through the server so it stays
// behind the viewer-password middleware instead of exposing the blob URL.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const pathname = req.nextUrl.searchParams.get('path') || '';
  // Only allow reading run artifacts; never arbitrary blobs.
  if (!pathname.startsWith('runs/') || pathname.includes('..')) {
    return new NextResponse('forbidden', { status: 403 });
  }
  const url = await getAssetUrl(pathname);
  if (!url) return new NextResponse('not found', { status: 404 });

  const upstream = await fetch(url, { cache: 'no-store' });
  if (!upstream.ok || !upstream.body) {
    return new NextResponse('not found', { status: 404 });
  }
  return new NextResponse(upstream.body, {
    status: 200,
    headers: {
      'Content-Type': upstream.headers.get('content-type') || 'application/octet-stream',
      'Cache-Control': 'private, max-age=60',
    },
  });
}
