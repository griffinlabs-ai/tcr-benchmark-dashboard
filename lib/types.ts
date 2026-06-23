// Shape of a run summary as written by analyze_run.py (summary.json).
// Kept loose (index signature) so new metrics do not break the reader; the
// known fields are typed for convenience.
export interface RunSummary {
  schema_version?: number;
  run_id: string;
  timestamp?: string;
  git_sha?: string;
  param_hash?: string;
  env_label?: string;
  notes?: string;
  hostname?: string;
  completed?: boolean;
  final_coverage_m2?: number;
  reference_area_m2?: number | null;
  coverage_fraction?: number | null;
  distance_m?: number;
  time_to_complete_s?: number;
  area_per_meter?: number;
  coverage_rate_m2_per_min?: number;
  coverage_auc_vs_distance?: number;
  time_to_90pct_s?: number | null;
  time_to_95pct_s?: number | null;
  goals_dispatched?: number;
  preemptions?: number;
  goal_aborts?: number;
  suppressions?: number;
  near_far_pick_ratio?: number | null;
  cpu_pct_mean?: number | null;
  cpu_pct_peak?: number | null;
  rss_peak_mb?: number | null;
  // Enrichment added by the reader, not present in summary.json:
  params?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface TimeseriesRow {
  t_s: number;
  distance_m: number;
  known_m2: number;
  free_m2: number;
}

export interface DecisionRow {
  index: number;
  mode: string;
  x: number | null;
  y: number | null;
}

// Metrics offered in the UI selectors.
export const HEADLINE_METRICS = [
  'area_per_meter',
  'coverage_rate_m2_per_min',
  'coverage_fraction',
  'final_coverage_m2',
  'distance_m',
  'time_to_complete_s',
  'coverage_auc_vs_distance',
  'goals_dispatched',
  'preemptions',
  'cpu_pct_mean',
] as const;
