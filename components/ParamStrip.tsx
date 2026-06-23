'use client';

import {
  CartesianGrid,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from 'recharts';

import type { ParamPoint } from '@/lib/params';

const COLORS = ['#5b9dff', '#ff8f5b', '#5bd6a0', '#d65b9d', '#d6c75b', '#9d5bd6'];

export default function ParamStrip({
  points,
  metric,
  param,
}: {
  points: ParamPoint[];
  metric: string;
  param: string;
}) {
  const envs = Array.from(new Set(points.map((p) => p.env_label)));
  return (
    <div className="panel">
      <div className="eyebrow">
        {metric} vs {param} (by environment)
      </div>
      <ResponsiveContainer width="100%" height={360}>
        <ScatterChart margin={{ top: 8, right: 16, bottom: 24, left: 8 }}>
          <CartesianGrid stroke="#23252c" />
          <XAxis
            type="category"
            dataKey="param_value"
            name={param}
            stroke="#9da2b3"
            tick={{ fontSize: 11 }}
            allowDuplicatedCategory={false}
          />
          <YAxis
            type="number"
            dataKey="metric_value"
            name={metric}
            stroke="#9da2b3"
            tick={{ fontSize: 11 }}
          />
          <ZAxis range={[80, 80]} />
          <Tooltip
            cursor={{ strokeDasharray: '3 3' }}
            contentStyle={{ background: '#101216', border: '1px solid #34373f', borderRadius: 8 }}
          />
          {envs.map((env, i) => (
            <Scatter
              key={env}
              name={env}
              data={points.filter((p) => p.env_label === env)}
              fill={COLORS[i % COLORS.length]}
            />
          ))}
        </ScatterChart>
      </ResponsiveContainer>
      <div className="muted" style={{ fontSize: 12 }}>
        {envs.map((env, i) => (
          <span key={env} style={{ marginRight: 12 }}>
            <span style={{ color: COLORS[i % COLORS.length] }}>&#9632;</span> {env}
          </span>
        ))}
      </div>
    </div>
  );
}
