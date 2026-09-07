"use client";

import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis, LabelList } from "recharts";

// Removed static data array

const CustomBar = (props: any) => {
  const { fill, x, y, width, height, isCurrent } = props;

  if (isCurrent) {
    return (
      <g>
        <defs>
          <linearGradient id="brandGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#E6399B" />
            <stop offset="100%" stopColor="#7C3AED" />
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        {/* Ambient Glow */}
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          fill="url(#brandGradient)"
          rx={8}
          ry={8}
          filter="url(#glow)"
          opacity={0.8}
          className="transition-all duration-300"
        />
        {/* Main Bar */}
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          fill="url(#brandGradient)"
          rx={8}
          ry={8}
          stroke="rgba(255,255,255,0.4)"
          strokeWidth={1}
        />
      </g>
    );
  }

  return (
    <rect
      x={x}
      y={y}
      width={width}
      height={height}
      fill="#2c2833" // surface-container-high
      rx={8}
      ry={8}
      className="hover:fill-[#3c3742] transition-colors duration-300 cursor-pointer"
    />
  );
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-surface-container-high border border-outline-variant/40 px-3 py-2 rounded-lg shadow-lg">
        <p className="text-data-mono font-data-mono text-outline mb-1">{payload[0].payload.name}</p>
        <p className="text-body-md font-body-md font-bold text-white">€{payload[0].value.toLocaleString()}</p>
      </div>
    );
  }
  return null;
};

const formatValue = (val: number) => {
  if (val === 0) return '';
  if (val >= 1000) return `€${(val / 1000).toFixed(1)}k`;
  return `€${val}`;
};

export function MonthlyCadenceChart({ data = [] }: { data?: any[] }) {
  // Use fallback if data is empty to ensure chart renders
  const chartData = data.length > 0 ? data : [
    { name: "MAY", value: 0 },
    { name: "JUN", value: 0 },
    { name: "JUL", value: 0 },
    { name: "AUG", value: 0 },
    { name: "SEP", value: 0 },
    { name: "OCT", value: 0, isCurrent: true },
  ];

  return (
    <div className="w-full h-56 mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 20, right: 0, left: 0, bottom: 0 }} barSize={48}>
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: "#a68994", fontSize: 11, fontWeight: 600, fontFamily: "Inter" }}
            dy={10}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "transparent" }} />
          <Bar dataKey="value" shape={<CustomBar />} animationDuration={1500}>
            <LabelList dataKey="value" position="top" fill="#a68994" fontSize={12} fontFamily="Inter" fontWeight={600} formatter={formatValue as any} />
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.isCurrent ? "url(#brandGradient)" : "#2c2833"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
