import { NextRequest, NextResponse } from 'next/server';

import { putArtifact, rebuildIndex, runPath } from '@/lib/store';

// Needs Node runtime for Buffer + @vercel/blob put with binary bodies.
export const runtime = 'nodejs';
// Never cache; this is a write endpoint.
export const dynamic = 'force-dynamic';

const ALLOWED_FILES = new Set([
  'summary.json',
  'timeseries.csv',
  'decisions.csv',
  'map.png',
  'params.yaml',
]);

const CONTENT_TYPES: Record<string, string> = {
  json: 'application/json',
  csv: 'text/csv',
  png: 'image/png',
  yaml: 'application/x-yaml',
};

function contentTypeFor(name: string, fallback: string): string {
  const ext = name.split('.').pop()?.toLowerCase() || '';
  return CONTENT_TYPES[ext] || fallback || 'application/octet-stream';
}

// run_id must be a single safe path segment.
function isSafeRunId(runId: string): boolean {
  return /^[A-Za-z0-9._-]+$/.test(runId) && !runId.includes('..');
}

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

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ ok: false, error: 'expected multipart/form-data' }, { status: 400 });
  }

  const runId = String(form.get('run_id') || '');
  if (!runId || !isSafeRunId(runId)) {
    return NextResponse.json({ ok: false, error: 'missing or invalid run_id' }, { status: 400 });
  }

  let written = 0;
  for (const [field, value] of form.entries()) {
    if (field === 'run_id') continue;
    if (typeof value === 'string') continue; // only file parts
    const file = value as File;
    const name = file.name || field;
    if (!ALLOWED_FILES.has(name)) continue; // ignore unexpected files
    const buf = Buffer.from(await file.arrayBuffer());
    await putArtifact(runPath(runId, name), buf, contentTypeFor(name, file.type));
    written += 1;
  }

  if (written === 0) {
    return NextResponse.json({ ok: false, error: 'no recognized artifact files' }, { status: 400 });
  }

  const total = await rebuildIndex();
  return NextResponse.json({ ok: true, run_id: runId, files: written, index_runs: total });
}
