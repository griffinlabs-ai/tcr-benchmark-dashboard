import { NextRequest, NextResponse } from 'next/server';

import { resetStore } from '@/lib/store';

// Token-gated full reset: deletes all run artifacts + index.json from Blob.
// Useful to clear demo/test data before going live. Reuses INGEST_TOKEN.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const expected = process.env.INGEST_TOKEN;
  if (!expected) {
    return NextResponse.json(
      { ok: false, error: 'INGEST_TOKEN not configured on server' },
      { status: 503 },
    );
  }
  const auth = req.headers.get('authorization') || '';
  if (auth !== `Bearer ${expected}`) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }
  const deleted = await resetStore();
  return NextResponse.json({ ok: true, deleted });
}
