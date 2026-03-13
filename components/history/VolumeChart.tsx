'use client'

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface VolumeDataPoint {
  date: string | Date
  volume: number
  progressPct?: number
}

interface VolumeChartProps {
  data: VolumeDataPoint[]
  exerciseName?: string
}

export function VolumeChart({ data, exerciseName = "Volumen Global" }: VolumeChartProps) {
  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
      <h3 className="text-sm text-zinc-400 mb-6">{exerciseName}</h3>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data} margin={{ top: 4, right: 0, bottom: 0, left: -20 }}>
          <defs>
            <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="date"
            tickFormatter={(d) => format(new Date(d), 'dd MMM', { locale: es })}
            tick={{ fontSize: 11, fill: '#71717a' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis tick={{ fontSize: 11, fill: '#71717a' }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ background: '#18181b', border: '1px solid #27272a', borderRadius: 12, color: '#f4f4f5' }}
            labelFormatter={(d) => format(new Date(d), 'dd MMMM yyyy', { locale: es })}
            formatter={(value: any) => [`${value.toLocaleString()} kg`, 'Volumen']}
          />
          <Area
            type="monotone"
            dataKey="volume"
            stroke="#22c55e"
            strokeWidth={2}
            fill="url(#volumeGradient)"
            dot={{ fill: '#22c55e', strokeWidth: 0, r: 3 }}
            activeDot={{ r: 5, fill: '#4ade80' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
