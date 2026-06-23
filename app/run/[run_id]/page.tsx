import LineChartCard from '@/components/LineChartCard';
import { parseCsv, toNumber } from '@/lib/csv';
import { parseParams } from '@/lib/params';
import { getDecisionsCsv, getParamsYaml, getRunSummary, getTimeseriesCsv } from '@/lib/store';

export const dynamic = 'force-dynamic';

function fmt(v: unknown): string {
  if (v === null || v === undefined) return '-';
  if (typeof v === 'number') return Number.isInteger(v) ? String(v) : v.toFixed(3);
  if (typeof v === 'boolean') return v ? 'yes' : 'no';
  return String(v);
}

const CARDS: { key: string; label: string }[] = [
  { key: 'final_coverage_m2', label: 'Coverage (m^2)' },
  { key: 'distance_m', label: 'Distance (m)' },
  { key: 'area_per_meter', label: 'Area / meter' },
  { key: 'time_to_complete_s', label: 'Time to complete (s)' },
  { key: 'coverage_fraction', label: 'Coverage fraction' },
  { key: 'coverage_rate_m2_per_min', label: 'Coverage rate (m^2/min)' },
  { key: 'goals_dispatched', label: 'Goals dispatched' },
  { key: 'preemptions', label: 'Preemptions' },
  { key: 'cpu_pct_mean', label: 'CPU mean (%)' },
  { key: 'cpu_pct_peak', label: 'CPU peak (%)' },
  { key: 'rss_peak_mb', label: 'RSS peak (MB)' },
  { key: 'near_far_pick_ratio', label: 'Near/far pick ratio' },
];

export default async function RunDetail({ params }: { params: { run_id: string } }) {
  const runId = decodeURIComponent(params.run_id);
  const summary = await getRunSummary(runId);
  if (!summary) {
    return (
      <div className="panel muted">Run {runId} not found.</div>
    );
  }

  const tsText = await getTimeseriesCsv(runId);
  const series = tsText
    ? parseCsv(tsText).map((r) => ({
        t_s: toNumber(r.t_s) ?? 0,
        distance_m: toNumber(r.distance_m) ?? 0,
        known_m2: toNumber(r.known_m2) ?? 0,
      }))
    : [];

  const decText = await getDecisionsCsv(runId);
  const decisions = decText ? parseCsv(decText) : [];

  const paramsYaml = await getParamsYaml(runId);
  const paramsObj = paramsYaml ? parseParams(paramsYaml) : {};

  const mapSrc = `/api/asset?path=${encodeURIComponent(`runs/${runId}/map.png`)}`;

  return (
    <>
      <h2>{runId}</h2>
      <div className="muted" style={{ marginBottom: 12 }}>
        <span className="tag">{summary.env_label || 'unknown'}</span>{' '}
        <span className="tag">git {summary.git_sha || '?'}</span>{' '}
        <span className="tag">params {summary.param_hash || '?'}</span>{' '}
        <span className="tag">{summary.completed ? 'completed' : 'manual/timeout'}</span>
        {summary.notes ? <div style={{ marginTop: 6 }}>{summary.notes}</div> : null}
      </div>

      <div className="cards">
        {CARDS.map((c) => (
          <div className="card" key={c.key}>
            <div className="label">{c.label}</div>
            <div className="value">{fmt(summary[c.key])}</div>
          </div>
        ))}
      </div>

      <div className="row" style={{ marginTop: 16 }}>
        {series.length > 0 ? (
          <>
            <LineChartCard
              data={series}
              xKey="distance_m"
              yKey="known_m2"
              title="Coverage vs distance"
              xLabel="distance (m)"
            />
            <LineChartCard
              data={series}
              xKey="t_s"
              yKey="known_m2"
              title="Coverage vs time"
              xLabel="time (s)"
            />
          </>
        ) : (
          <div className="panel muted">No timeseries recorded.</div>
        )}
      </div>

      <div className="row">
        <div className="panel">
          <div className="muted" style={{ marginBottom: 8 }}>
            Final occupancy map
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={mapSrc} alt="final occupancy map" style={{ maxWidth: '100%', borderRadius: 8 }} />
        </div>
        <div className="panel">
          <div className="muted" style={{ marginBottom: 8 }}>
            Parameters
          </div>
          <pre style={{ overflowX: 'auto', maxHeight: 360 }}>
            {JSON.stringify(paramsObj, null, 2)}
          </pre>
        </div>
      </div>

      {decisions.length > 0 ? (
        <div className="panel" style={{ overflowX: 'auto' }}>
          <div className="muted" style={{ marginBottom: 8 }}>
            Decisions ({decisions.length})
          </div>
          <table>
            <thead>
              <tr>
                {Object.keys(decisions[0]).map((k) => (
                  <th key={k}>{k}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {decisions.map((d, i) => (
                <tr key={i}>
                  {Object.keys(decisions[0]).map((k) => (
                    <td key={k}>{d[k]}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </>
  );
}
