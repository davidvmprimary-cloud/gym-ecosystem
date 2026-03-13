'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface WeightChartProps {
  data: Array<{
    date: Date | string
    weightKg: number
  }>
}

export function WeightChart({ data }: WeightChartProps) {
  const formattedData = data.map(d => ({
    ...d,
    dateStr: format(new Date(d.date), 'dd MMM', { locale: es }),
    weight: Number(d.weightKg.toFixed(1))
  }))

  if (formattedData.length === 0) {
    return (
      <div className="h-[240px] flex items-center justify-center bg-gym-dark-1/30 rounded-gym border border-dashed border-gym-border">
        <p className="text-[13px] text-gym-secondary italic">Sin registros de peso aún</p>
      </div>
    )
  }

  return (
    <div className="h-[240px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={formattedData} margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
          <XAxis 
            dataKey="dateStr" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#A3A3A3', fontSize: 10 }} 
            dy={10}
          />
          <YAxis 
            hide 
            domain={['dataMin - 5', 'dataMax + 5']} 
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#171717', 
              border: '1px solid #262626', 
              borderRadius: '8px',
              fontSize: '12px',
              color: '#F5F5F5'
            }}
            itemStyle={{ color: '#4ADE80' }}
            labelStyle={{ color: '#A3A3A3', marginBottom: '4px' }}
            formatter={(value) => [`${value} kg`, 'Peso']}
            labelFormatter={(label) => `${label}`}
          />
          <Line 
            type="monotone" 
            dataKey="weight" 
            stroke="#4ADE80" 
            strokeWidth={3} 
            dot={{ fill: '#4ADE80', strokeWidth: 2, r: 4, stroke: '#0A0A0A' }}
            activeDot={{ r: 6, fill: '#4ADE80', stroke: '#F5F5F5', strokeWidth: 2 }}
            animationDuration={1500}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
