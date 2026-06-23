'use client';

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

export interface CompareSeries {
  run_id: string;
  points: { distance_m: number; known_m2: number }[];
}

const COLORS = ['#5b9dff', '#ff8f5b', '#5bd6a0', '#d65b9d', '#d6c75b', '#9d5bd6', '#5bd6d6'];

export default function CompareChart({ series }: { series: CompareSeries[] }) {
  return (
    <div className="panel">
      <div className="muted" style={{ marginBottom: 8 }}>
        Coverage vs distance (overlay)
      </div>
      <ResponsiveContainer width="100%" height={360}>
        <LineChart margin={{ top: 8, right: 16, bottom: 16, left: 8 }}>
          <CartesianGrid stroke="#262b36" />
          <XAxis
            type="number"
            dataKey="distance_m"
            stroke="#9aa3b2"
            tick={{ fontSize: 11 }}
            label={{ value: 'distance (m)', position: 'insideBottom', offset: -4, fill: '#9aa3b2' }}
          />
          <YAxis
            stroke="#9aa3b2"
            tick={{ fontSize: 11 }}
            label={{ value: 'known area (m^2)', angle: -90, position: 'insideLeft', fill: '#9aa3b2' }}
          />
          <Tooltip contentStyle={{ background: '#171a22', border: '1px solid #262b36' }} />
          {series.map((s, i) => (
            <Line
              key={s.run_id}
              data={s.points}
              type="monotone"
              dataKey="known_m2"
              name={s.run_id}
              stroke={COLORS[i % COLORS.length]}
              dot={false}
              strokeWidth={2}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
      <div className="muted" style={{ fontSize: 12 }}>
        {series.map((s, i) => (
          <span key={s.run_id} style={{ marginRight: 12 }}>
            <span style={{ color: COLORS[i % COLORS.length] }}>&#9632;</span> {s.run_id}
          </span>
        ))}
      </div>
    </div>
  );
}
