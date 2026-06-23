import { getIndex } from '@/lib/store';
import type { RunSummary } from '@/lib/types';

export const dynamic = 'force-dynamic';

const COLUMNS: { key: keyof RunSummary | string; label: string }[] = [
  { key: 'run_id', label: 'run_id' },
  { key: 'env_label', label: 'env' },
  { key: 'git_sha', label: 'git' },
  { key: 'completed', label: 'done' },
  { key: 'area_per_meter', label: 'area/m' },
  { key: 'coverage_fraction', label: 'cov frac' },
  { key: 'final_coverage_m2', label: 'cov m^2' },
  { key: 'distance_m', label: 'dist m' },
  { key: 'time_to_complete_s', label: 'time s' },
  { key: 'goals_dispatched', label: 'goals' },
  { key: 'preemptions', label: 'preempts' },
  { key: 'cpu_pct_mean', label: 'cpu%' },
];

function fmt(v: unknown): string {
  if (v === null || v === undefined) return '-';
  if (typeof v === 'number') return Number.isInteger(v) ? String(v) : v.toFixed(3);
  if (typeof v === 'boolean') return v ? 'yes' : 'no';
  return String(v);
}

export default async function RunsPage() {
  const runs = await getIndex();
  return (
    <>
      <h2>Runs ({runs.length})</h2>
      {runs.length === 0 ? (
        <div className="panel muted">
          No runs yet. Record a run on the robot and push it (run_recorder with
          push:=true, or push_run).
        </div>
      ) : (
        <div className="panel" style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                {COLUMNS.map((c) => (
                  <th key={String(c.key)}>{c.label}</th>
                ))}
                <th>notes</th>
              </tr>
            </thead>
            <tbody>
              {runs.map((r) => (
                <tr key={r.run_id}>
                  {COLUMNS.map((c) => (
                    <td key={String(c.key)}>
                      {c.key === 'run_id' ? (
                        <a href={`/run/${encodeURIComponent(r.run_id)}`}>{r.run_id}</a>
                      ) : (
                        fmt(r[c.key as keyof RunSummary])
                      )}
                    </td>
                  ))}
                  <td className="muted">{r.notes || ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
