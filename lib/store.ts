// Vercel Blob access layer. All run artifacts live under runs/<run_id>/ and the
// derived index lives at index.json. Pathnames are deterministic
// (addRandomSuffix: false) so the reader can address files by run_id.
//
// Reads go through the server (never expose blob URLs to the browser except via
// the gated /api/asset proxy), keeping everything behind the viewer password.
import { list, put } from '@vercel/blob';

import type { RunSummary } from './types';

const INDEX_PATH = 'index.json';

function runPath(runId: string, file: string): string {
  return `runs/${runId}/${file}`;
}

export async function putArtifact(
  pathname: string,
  data: Buffer | string,
  contentType: string,
): Promise<void> {
  await put(pathname, data, {
    access: 'public',
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType,
  });
}

async function blobUrl(pathname: string): Promise<string | null> {
  // Resolve a deterministic pathname to its blob URL via list (the head() API
  // expects a full blob URL, not a pathname).
  try {
    const page = await list({ prefix: pathname, limit: 1000 });
    const match = page.blobs.find((b) => b.pathname === pathname);
    return match ? match.url : null;
  } catch {
    return null;
  }
}

export async function readText(pathname: string): Promise<string | null> {
  const url = await blobUrl(pathname);
  if (!url) return null;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) return null;
  return res.text();
}

export async function readJson<T>(pathname: string): Promise<T | null> {
  const text = await readText(pathname);
  if (text === null) return null;
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

// ---- Index --------------------------------------------------------------

export async function getIndex(): Promise<RunSummary[]> {
  const idx = await readJson<RunSummary[]>(INDEX_PATH);
  return idx ?? [];
}

// Rebuild index.json by listing every runs/<id>/summary.json. O(#runs); fine for
// hundreds of runs. Called on each ingest so the table stays current.
export async function rebuildIndex(): Promise<number> {
  const summaries: RunSummary[] = [];
  let cursor: string | undefined;
  do {
    const page = await list({ prefix: 'runs/', cursor, limit: 1000 });
    for (const blob of page.blobs) {
      if (blob.pathname.endsWith('/summary.json')) {
        const res = await fetch(blob.url, { cache: 'no-store' });
        if (res.ok) {
          try {
            summaries.push((await res.json()) as RunSummary);
          } catch {
            /* skip malformed */
          }
        }
      }
    }
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);

  summaries.sort((a, b) => (b.run_id || '').localeCompare(a.run_id || ''));
  await putArtifact(INDEX_PATH, JSON.stringify(summaries), 'application/json');
  return summaries.length;
}

// ---- Per-run reads ------------------------------------------------------

export async function getRunSummary(runId: string): Promise<RunSummary | null> {
  return readJson<RunSummary>(runPath(runId, 'summary.json'));
}

export async function getTimeseriesCsv(runId: string): Promise<string | null> {
  return readText(runPath(runId, 'timeseries.csv'));
}

export async function getDecisionsCsv(runId: string): Promise<string | null> {
  return readText(runPath(runId, 'decisions.csv'));
}

export async function getParamsYaml(runId: string): Promise<string | null> {
  return readText(runPath(runId, 'params.yaml'));
}

export async function getAssetUrl(pathname: string): Promise<string | null> {
  return blobUrl(pathname);
}

export { runPath };
