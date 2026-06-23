import CompareChart, { CompareSeries } from '@/components/CompareChart';
import { parseCsv, toNumber } from '@/lib/csv';
import { getIndex, getTimeseriesCsv } from '@/lib/store';
import { HEADLINE_METRICS } from '@/lib/types';

export const dynamic = 'force-dynamic';

function asArray(v: string | string[] | undefined): string[] {
  if (!v) return [];
  return Array.isArray(v) ? v : [v];
}

function fmt(v: unknown): string {
  if (v === null || v === undefined) return '-';
  if (typeof v === 'number') return Number.isInteger(v) ? String(v) : v.toFixed(3);
  return String(v);
}

export default async function ComparePage({
  searchParams,
}: {
  searchParams: { runs?: string | string[]; metric?: string };
}) {
  const index = await getIndex();
  const selected = asArray(searchParams.runs);
  const metric = searchParams.metric || 'area_per_meter';

  const series: CompareSeries[] = [];
  for (const runId of selected) {
    const text = await getTimeseriesCsv(runId);
    if (!text) continue;
    const points = parseCsv(text).map((r) => ({
      distance_m: toNumber(r.distance_m) ?? 0,
      known_m2: toNumber(r.known_m2) ?? 0,
    }));
    series.push({ run_id: runId, points });
  }
  const selectedRuns = index.filter((r) => selected.includes(r.run_id));

  return (
    <>
      <h2>Compare runs</h2>
      <form className="panel" method="get">
        <div className="row">
          <div>
            <div className="muted">Runs (ctrl/cmd-click for multiple)</div>
            <select name="runs" multiple size={8} style={{ width: '100%' }} defaultValue={selected}>
              {index.map((r) => (
                <option key={r.run_id} value={r.run_id}>
                  {r.run_id} [{r.env_label}]
                </option>
              ))}
            </select>
          </div>
          <div style={{ maxWidth: 260 }}>
            <div className="muted">Delta metric</div>
            <select name="metric" defaultValue={metric} style={{ width: '100%' }}>
              {HEADLINE_METRICS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            <button type="submit" style={{ marginTop: 12 }}>
              Compare
            </button>
          </div>
        </div>
      </form>

      {series.length > 0 ? <CompareChart series={series} /> : null}

      {selectedRuns.length > 0 ? (
        <div className="panel" style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>run_id</th>
                <th>env</th>
                <th>git</th>
                <th>params</th>
                <th>{metric}</th>
              </tr>
            </thead>
            <tbody>
              {selectedRuns.map((r) => (
                <tr key={r.run_id}>
                  <td>
                    <a href={`/run/${encodeURIComponent(r.run_id)}`}>{r.run_id}</a>
                  </td>
                  <td>{r.env_label}</td>
                  <td>{r.git_sha}</td>
                  <td>{r.param_hash}</td>
                  <td>{fmt(r[metric])}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="panel muted">Select runs above and click Compare.</div>
      )}
    </>
  );
}
