import RunRow from '@/components/RunRow';
import { getIndex } from '@/lib/store';

export const dynamic = 'force-dynamic';

const COLUMNS: { key: string; label: string }[] = [
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
                <th>map</th>
                {COLUMNS.map((c) => (
                  <th key={String(c.key)}>{c.label}</th>
                ))}
                <th>notes</th>
              </tr>
            </thead>
            <tbody>
              {runs.map((r) => (
                <RunRow key={r.run_id} run={r} columns={COLUMNS} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
