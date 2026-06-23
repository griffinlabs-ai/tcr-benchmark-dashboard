# frontier-benchmark-web

Next.js dashboard for frontier exploration benchmark runs, deployed on Vercel.
It reads the small derived artifacts (`summary.json`, `timeseries.csv`,
`decisions.csv`, `map.png`, `params.yaml`) that the robot pushes into Vercel
Blob. It never parses a rosbag and has no ROS dependency.

## Architecture

```
robot:  run_recorder -> analyze_run -> push_run --(HTTPS multipart)-->  /api/ingest
cloud:  /api/ingest -> Vercel Blob (runs/<run_id>/*) + rebuild index.json
        pages read Blob server-side, gated by VIEWER_PASSWORD (Basic auth)
```

- `/` Runs table
- `/run/[run_id]` Run detail (metric cards, coverage curves, map, params, decisions)
- `/compare` Overlay coverage-vs-distance for selected runs + delta table
- `/params` Metric-vs-parameter strip plot, mean/std/count, and OFAT A/B pairs
- `POST /api/ingest` Token-authed upload from the robot
- `GET /api/asset?path=runs/<id>/map.png` Gated blob proxy for images

## Setup on Vercel

1. Create a Vercel project from this repo. The Next.js app is at the repository
   root, so leave Root Directory at the default (`./`).
2. Add a Vercel Blob store (Storage tab). This injects `BLOB_READ_WRITE_TOKEN`.
3. Add environment variables (Project Settings -> Environment Variables):
   - `INGEST_TOKEN` - long random string; must match the robot's
     `FRONTIER_BENCHMARK_INGEST_TOKEN`.
   - `VIEWER_PASSWORD` - shared password to view the dashboard.
4. Deploy. The dashboard is at `https://<project>.vercel.app` (Basic auth: any
   username + `VIEWER_PASSWORD`).

## Point the robot at it

```bash
export FRONTIER_BENCHMARK_CLOUD_URL=https://<project>.vercel.app
export FRONTIER_BENCHMARK_INGEST_TOKEN=<same as INGEST_TOKEN>

# auto-push after each run:
ros2 launch frontier_benchmark record_run.launch.py env_label:=lab_roomA push:=true
# or push an existing run / drain the retry queue:
ros2 run frontier_benchmark push_run /path/to/results/<run_id>
ros2 run frontier_benchmark push_run --all-pending
```

## Local development

```bash
npm install
echo "INGEST_TOKEN=dev\nVIEWER_PASSWORD=\nBLOB_READ_WRITE_TOKEN=<from vercel>" > .env.local
npm run dev   # http://localhost:3000
```

Leaving `VIEWER_PASSWORD` empty disables the Basic-auth gate (local only).
`BLOB_READ_WRITE_TOKEN` from a real Blob store is needed for reads/writes; use
`vercel env pull` to fetch it.

## Notes / hardening

- Blobs are stored with public (but deterministic) URLs; the pages proxy reads
  server-side and gate images via `/api/asset`, so URLs are not exposed in the
  UI. For stricter isolation, move to private blobs or signed URLs.
- Index is rebuilt by listing `runs/*/summary.json` on each ingest - fine for
  hundreds of runs. Switch to a DB (Postgres/KV) if it grows large.
- Auth is intentionally minimal (one ingest token + one viewer password). Put
  SSO / per-user auth in front if needed.
