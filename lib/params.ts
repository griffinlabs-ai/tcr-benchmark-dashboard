// Param parsing + cross-run "how does a param affect the metric" aggregation.
// This is a TypeScript port of the lightweight JSON/YAML aggregation in
// compare_runs.py (metric_vs_param + OFAT highlighting). No ROS involved.
import YAML from 'yaml';

import { getParamsYaml } from './store';
import type { RunSummary } from './types';

// Unwrap the ros2 `param dump` format: { node: { ros__parameters: {...} } }.
export function parseParams(yamlText: string): Record<string, unknown> {
  let data: unknown;
  try {
    data = YAML.parse(yamlText);
  } catch {
    return {};
  }
  if (!data || typeof data !== 'object') return {};
  for (const block of Object.values(data as Record<string, unknown>)) {
    if (block && typeof block === 'object' && 'ros__parameters' in block) {
      const params = (block as Record<string, unknown>).ros__parameters;
      if (params && typeof params === 'object') {
        return params as Record<string, unknown>;
      }
    }
  }
  return {};
}

// Attach each run's params (read from its params.yaml blob). Done in parallel.
export async function enrichWithParams(runs: RunSummary[]): Promise<RunSummary[]> {
  await Promise.all(
    runs.map(async (run) => {
      if (run.params) return;
      const yamlText = await getParamsYaml(run.run_id);
      run.params = yamlText ? parseParams(yamlText) : {};
    }),
  );
  return runs;
}

export interface ParamPoint {
  param_value: string;
  metric_value: number;
  env_label: string;
  run_id: string;
}

export function metricVsParam(
  runs: RunSummary[],
  metric: string,
  param: string,
): ParamPoint[] {
  const points: ParamPoint[] = [];
  for (const run of runs) {
    const pv = run.params?.[param];
    const mv = run[metric];
    if (pv === undefined || pv === null || typeof mv !== 'number') continue;
    points.push({
      param_value: String(pv),
      metric_value: mv,
      env_label: run.env_label || 'unknown',
      run_id: run.run_id,
    });
  }
  return points;
}

export function allParamKeys(runs: RunSummary[]): string[] {
  const keys = new Set<string>();
  for (const run of runs) {
    for (const k of Object.keys(run.params || {})) keys.add(k);
  }
  return Array.from(keys).sort();
}

// One-factor-at-a-time pairs: runs in the same env whose other params match but
// the target param differs. These are the trustworthy A/B comparisons.
export interface OfatGroup {
  env_label: string;
  values: { param_value: string; metric_value: number; run_id: string }[];
}

export function ofatGroups(
  runs: RunSummary[],
  metric: string,
  param: string,
): OfatGroup[] {
  const byKey = new Map<string, RunSummary[]>();
  for (const run of runs) {
    const others = { ...(run.params || {}) };
    delete others[param];
    const key =
      (run.env_label || 'unknown') +
      '|' +
      Object.keys(others)
        .sort()
        .map((k) => `${k}=${String(others[k])}`)
        .join(',');
    byKey.set(key, [...(byKey.get(key) || []), run]);
  }
  const groups: OfatGroup[] = [];
  for (const group of byKey.values()) {
    const values = new Map<string, { metric_value: number; run_id: string }>();
    for (const run of group) {
      const pv = run.params?.[param];
      const mv = run[metric];
      if (pv === undefined || pv === null || typeof mv !== 'number') continue;
      values.set(String(pv), { metric_value: mv, run_id: run.run_id });
    }
    if (values.size >= 2) {
      groups.push({
        env_label: group[0].env_label || 'unknown',
        values: Array.from(values.entries()).map(([param_value, v]) => ({
          param_value,
          ...v,
        })),
      });
    }
  }
  return groups;
}
