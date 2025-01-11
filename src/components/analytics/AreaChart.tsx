import React from 'react';
import { AreaChart as RechartsAreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DataPoint {
  name: string;
  value: number;
}

interface AreaChartProps {
  data: DataPoint[];
  color: string;
  title: string;
}

export default function AreaChart({ data, color, title }: AreaChartProps) {
  return (
    <div className="h-[300px] w-full">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsAreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Area type="monotone" dataKey="value" stroke={color} fill={color} fillOpacity={0.2} />
        </RechartsAreaChart>
      </ResponsiveContainer>
    </div>
  );
}