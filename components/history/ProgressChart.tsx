'use client'

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

export function ProgressChart({ data, dataKey = "volume" }: { data: any[], dataKey?: string }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-48 w-full items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/50">
        <p className="text-sm text-zinc-500">No hay datos suficientes</p>
      </div>
    )
  }

  return (
    <div className="h-48 w-full rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
          <XAxis 
            dataKey="date" 
            stroke="#a1a1aa" 
            fontSize={12} 
            tickLine={false}
            axisLine={false}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}
            itemStyle={{ color: '#22c55e' }}
          />
          <Line 
            type="monotone" 
            dataKey={dataKey} 
            stroke="#22c55e" 
            strokeWidth={3}
            dot={{ fill: '#22c55e', r: 4, strokeWidth: 0 }}
            activeDot={{ r: 6, fill: '#16a34a' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
