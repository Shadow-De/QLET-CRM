'use client'

import dynamic from 'next/dynamic'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts'

interface ChartDataPoint {
  month: string
  label: string
  count: number
}

interface GrowthChartProps {
  data: ChartDataPoint[]
}

function GrowthChartInner({ data }: GrowthChartProps) {
  const maxCount = Math.max(...data.map((d) => d.count), 1)

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="rgba(168,85,247,0.08)" />
        <XAxis
          dataKey="label"
          tick={{ fill: '#9898B0', fontSize: 12 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          allowDecimals={false}
          tick={{ fill: '#9898B0', fontSize: 12 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            background: '#14141F',
            border: '1px solid rgba(168,85,247,0.2)',
            borderRadius: '8px',
            color: '#F1F1F8',
            fontSize: '13px',
          }}
          cursor={{ fill: 'rgba(168,85,247,0.05)' }}
          formatter={(value) => [Number(value), 'Deals Won']}
          labelStyle={{ color: '#9898B0', marginBottom: 4 }}
        />
        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.count === maxCount ? '#A855F7' : 'rgba(168,85,247,0.35)'}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

// Dynamic import avoids SSR issues with recharts
export const GrowthChart = dynamic(() => Promise.resolve(GrowthChartInner), {
  ssr: false,
  loading: () => (
    <div className="h-[220px] flex items-center justify-center text-text-muted text-sm">
      Loading chart...
    </div>
  ),
})
