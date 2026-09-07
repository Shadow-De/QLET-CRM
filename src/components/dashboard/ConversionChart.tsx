"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

type ConversionData = {
  name: string;
  value: number;
  color: string;
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-surface-container-high border border-outline-variant/40 px-3 py-2 rounded-lg shadow-lg">
        <p className="text-body-md font-body-md font-semibold text-white">{payload[0].payload.name}</p>
        <p className="text-label-sm font-label-sm text-outline">{payload[0].value}%</p>
      </div>
    );
  }
  return null;
};

export function ConversionChart({ data, yieldPercent }: { data: ConversionData[]; yieldPercent: number }) {
  return (
    <div className="relative w-32 h-32 flex flex-col items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Tooltip content={<CustomTooltip />} />
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={36}
            outerRadius={48}
            paddingAngle={2}
            dataKey="value"
            stroke="none"
            startAngle={90}
            endAngle={-270}
            animationDuration={1500}
            animationBegin={300}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.color} 
                style={entry.name === "Won Deals" ? { filter: "drop-shadow(0px 0px 8px rgba(250,74,171,0.5))" } : {}} 
              />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
        <span className="text-headline-md font-headline-md font-bold text-white leading-tight">{yieldPercent.toFixed(1)}%</span>
        <span className="text-label-sm font-label-sm text-outline text-[10px] uppercase">Yield</span>
      </div>
    </div>
  );
}
