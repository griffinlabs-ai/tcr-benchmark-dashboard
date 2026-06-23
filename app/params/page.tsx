import ParamStrip from '@/components/ParamStrip';
import { allParamKeys, enrichWithParams, metricVsParam, ofatGroups } from '@/lib/params';
import { getIndex } from '@/lib/store';
import { HEADLINE_METRICS } from '@/lib/types';

export const dynamic = 'force-dynamic';

function meanStd(values: number[]): { mean: number; std: number } {
  if (values.length === 0) return { mean: 0, std: 0 };
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((a, b) => a + (b - mean) ** 2, 0) / values.length;
  return { mean, std: Math.sqrt(variance) };
}

export default async function ParamsPage({
  searchParams,
}: {
  searchParams: { param?: string; metric?: string };
}) {
  const runs = await enrichWithParams(await getIndex());
  const paramKeys = allParamKeys(runs);
  const metric = searchParams.metric || 'area_per_meter';
  const param = searchParams.param || paramKeys[0] || '';

  const points = param ? metricVsParam(runs, metric, param) : [];
  const ofat = param ? ofatGroups(runs, metric, param) : [];

  // group-by (env, param_value) -> mean/std/count
  const groups = new Map<string, number[]>();
  for (const p of points) {
    const key = `${p.env_label}\u0001${p.param_value}`;
    groups.set(key, [...(groups.get(key) || []), p.metric_value]);
  }

  return (
    <>
      <h2>Param effect</h2>
      <form className="panel" method="get">
        <div className="row">
          <div style={{ maxWidth: 320 }}>
            <div className="muted">Parameter</div>
            <select name="param" defaultValue={param} style={{ width: '100%' }}>
              {paramKeys.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </div>
          <div style={{ maxWidth: 320 }}>
            <div className="muted">Metric</div>
            <select name="metric" defaultValue={metric} style={{ width: '100%' }}>
              {HEADLINE_METRICS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            <button type="submit" style={{ marginTop: 12 }}>
              Update
            </button>
          </div>
        </div>
      </form>

      {paramKeys.length === 0 ? (
        <div className="panel muted">
          No params found yet. Runs need a params.yaml (pushed alongside summary.json).
        </div>
      ) : points.length === 0 ? (
        <div className="panel muted">No runs have both this parameter and metric populated.</div>
      ) : (
        <>
          <ParamStrip points={points} metric={metric} param={param} />

          <div className="panel" style={{ overflowX: 'auto' }}>
            <div className="muted" style={{ marginBottom: 8 }}>
              {metric} by ({param}, environment)
            </div>
            <table>
              <thead>
                <tr>
                  <th>env</th>
                  <th>{param}</th>
                  <th>mean</th>
                  <th>std</th>
                  <th>count</th>
                </tr>
              </thead>
              <tbody>
                {Array.from(groups.entries()).map(([key, values]) => {
                  const [env, pv] = key.split('\u0001');
                  const { mean, std } = meanStd(values);
                  return (
                    <tr key={key}>
                      <td>{env}</td>
                      <td>{pv}</td>
                      <td>{mean.toFixed(3)}</td>
                      <td>{std.toFixed(3)}</td>
                      <td>{values.length}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {ofat.length > 0 ? (
            <div className="panel">
              <div className="muted" style={{ marginBottom: 8 }}>
                One-factor-at-a-time pairs (only {param} differs; other params equal)
              </div>
              <ul>
                {ofat.map((g, i) => (
                  <li key={i}>
                    <span className="tag">{g.env_label}</span>{' '}
                    {g.values
                      .sort((a, b) => a.param_value.localeCompare(b.param_value))
                      .map((v) => `${v.param_value} -> ${v.metric_value.toFixed(3)}`)
                      .join('   vs   ')}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </>
      )}
    </>
  );
}
