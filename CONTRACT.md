# Artifact contract

This dashboard is intentionally decoupled from the ROS code. The robot side lives
in the `tcr` monorepo (`frontier_benchmark` package: `run_recorder.py`,
`analyze_run.py`, `push.py`); this repo only consumes the small derived artifacts
those tools produce and push to `POST /api/ingest`.

The two sides stay in sync through this contract, not through shared code. The
`schema_version` field guards against silent drift: bump it in `analyze_run.py`
whenever the shape below changes in a breaking way, and handle old versions here.

## Per-run bundle (pushed by the robot)
Multipart `POST /api/ingest` with field `run_id` and these files:

| File | Type | Notes |
|------|------|-------|
| `summary.json` | JSON | headline metrics + provenance (see fields below) |
| `timeseries.csv` | CSV | columns: `t_s, distance_m, known_m2, free_m2` |
| `decisions.csv` | CSV | columns: `index, mode, x, y` |
| `map.png` | PNG | final occupancy render (grey unknown / white free / black occupied) |
| `params.yaml` | YAML | `ros2 param dump` of `/frontier_explorer` (`{node: {ros__parameters: {...}}}`) |

## summary.json fields
- `schema_version` (int)
- `run_id`, `timestamp`, `git_sha`, `param_hash`, `env_label`, `notes`, `hostname`
- `completed` (bool)
- `final_coverage_m2`, `reference_area_m2`, `coverage_fraction`
- `distance_m`, `time_to_complete_s`
- `area_per_meter`, `coverage_rate_m2_per_min`, `coverage_auc_vs_distance`
- `time_to_90pct_s`, `time_to_95pct_s`
- `goals_dispatched`, `preemptions`, `goal_aborts`, `suppressions`, `near_far_pick_ratio`
- `cpu_pct_mean`, `cpu_pct_peak`, `rss_peak_mb`

## Cloud-derived (not pushed)
- `index.json` is rebuilt server-side on each ingest by listing `runs/*/summary.json`.

See [README.md](README.md) for deployment.
