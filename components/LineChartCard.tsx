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

interface Props {
  data: Record<string, number>[];
  xKey: string;
  yKey: string;
  title: string;
  xLabel?: string;
  yLabel?: string;
}

export default function LineChartCard({ data, xKey, yKey, title, xLabel, yLabel }: Props) {
  return (
    <div className="panel">
      <div className="muted" style={{ marginBottom: 8 }}>
        {title}
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data} margin={{ top: 8, right: 16, bottom: 16, left: 8 }}>
          <CartesianGrid stroke="#262b36" />
          <XAxis
            dataKey={xKey}
            stroke="#9aa3b2"
            tick={{ fontSize: 11 }}
            label={xLabel ? { value: xLabel, position: 'insideBottom', offset: -4, fill: '#9aa3b2' } : undefined}
          />
          <YAxis
            stroke="#9aa3b2"
            tick={{ fontSize: 11 }}
            label={yLabel ? { value: yLabel, angle: -90, position: 'insideLeft', fill: '#9aa3b2' } : undefined}
          />
          <Tooltip
            contentStyle={{ background: '#171a22', border: '1px solid #262b36' }}
            labelStyle={{ color: '#9aa3b2' }}
          />
          <Line type="monotone" dataKey={yKey} stroke="#5b9dff" dot={false} strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
