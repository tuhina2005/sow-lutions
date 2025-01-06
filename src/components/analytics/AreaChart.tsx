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
  // Find the min and max values of the data
  const minValue = Math.min(...data.map((item) => item.value));
  const maxValue = Math.max(...data.map((item) => item.value));

  return (
    <div className="h-[300px] w-full">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsAreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis domain={[minValue - 100, maxValue + 100]} /> {/* Adding buffer to the y-axis range */}
          <Tooltip />
          <Area type="monotone" dataKey="value" stroke={color} fill={color} fillOpacity={0.2} />
        </RechartsAreaChart>
      </ResponsiveContainer>
    </div>
  );
}
