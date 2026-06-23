'use client';

import { useRouter } from 'next/navigation';

import type { RunSummary } from '@/lib/types';

function fmt(v: unknown): string {
  if (v === null || v === undefined) return '-';
  if (typeof v === 'number') return Number.isInteger(v) ? String(v) : v.toFixed(3);
  if (typeof v === 'boolean') return v ? 'yes' : 'no';
  return String(v);
}

interface Props {
  run: RunSummary;
  columns: { key: string; label: string }[];
}

export default function RunRow({ run, columns }: Props) {
  const router = useRouter();
  const href = `/run/${encodeURIComponent(run.run_id)}`;
  const mapSrc = `/api/asset?path=${encodeURIComponent(`runs/${run.run_id}/map.png`)}`;

  return (
    <tr className="clickable-row" onClick={() => router.push(href)}>
      <td>
        <a href={href} onClick={(e) => e.stopPropagation()}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={mapSrc}
            alt="map"
            loading="lazy"
            width={72}
            height={72}
            style={{
              width: 72,
              height: 72,
              objectFit: 'cover',
              borderRadius: 6,
              border: '1px solid var(--border)',
              display: 'block',
            }}
          />
        </a>
      </td>
      {columns.map((c) => (
        <td key={c.key}>
          {c.key === 'run_id' ? (
            <a href={href} onClick={(e) => e.stopPropagation()}>
              {run.run_id}
            </a>
          ) : (
            fmt(run[c.key as keyof RunSummary])
          )}
        </td>
      ))}
      <td className="muted">{run.notes || ''}</td>
    </tr>
  );
}
