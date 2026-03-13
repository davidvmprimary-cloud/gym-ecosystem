'use client'

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Dot } from 'recharts'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface VolumeDataPoint {
  date: string | Date
  volume: number
  splitName?: string
}

interface VolumeChartProps {
  data: VolumeDataPoint[]
}

const CustomDot = (props: any) => {
  const { cx, cy, payload } = props
  const name = payload.splitName?.toLowerCase() || ''
  let fill = '#5FA870'
  if (name.includes('push')) fill = '#4A7FA5' // fitness-push
  if (name.includes('pull')) fill = '#3D6B47' // fitness-pull
  if (name.includes('legs') || name.includes('pierna')) fill = '#8B6B4E' // fitness-legs

  return <circle cx={cx} cy={cy} r={3} fill={fill} stroke="#0C0C0C" strokeWidth={1} />
}

export function VolumeChart({ data }: VolumeChartProps) {
  const formattedData = data.map(d => ({
    ...d,
    dateStr: format(new Date(d.date), 'd MMM', { locale: es }),
    volume: Math.round(d.volume)
  }))

  return (
    <div className="h-[200px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={formattedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#5FA870" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#5FA870" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
          <XAxis 
            dataKey="dateStr" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#8A8A8A', fontSize: 10 }}
            dy={10}
            minTickGap={20}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#8A8A8A', fontSize: 9 }}
            tickFormatter={(v) => `${v/1000}k`}
          />
          <Tooltip
            contentStyle={{ 
              backgroundColor: '#141414', 
              border: '1px solid #262626', 
              borderRadius: '12px',
              fontSize: '12px',
              color: '#F0F0F0'
            }}
            itemStyle={{ color: '#5FA870' }}
            labelStyle={{ color: '#8A8A8A', marginBottom: '4px' }}
            formatter={(value: any) => [`${value.toLocaleString()} kg`, 'Volumen']}
          />
          <Area
            type="monotone"
            dataKey="volume"
            stroke="#5FA870"
            strokeWidth={2.5}
            fill="url(#volumeGradient)"
            dot={<CustomDot />}
            activeDot={{ r: 5, fill: '#5FA870', stroke: '#F0F0F0', strokeWidth: 2 }}
            animationDuration={1500}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
