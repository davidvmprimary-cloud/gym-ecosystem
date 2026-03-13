'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Scatter, ScatterChart } from 'recharts'
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
    dateValue: new Date(d.date).getTime(),
    dateStr: format(new Date(d.date), 'dd MMM', { locale: es }),
    weight: Number(d.weightKg.toFixed(1))
  }))

  if (formattedData.length === 0) {
    return (
      <div className="h-[140px] flex items-center justify-center bg-gym-dark-1/30 rounded-gym border border-dashed border-gym-border">
        <p className="text-[12px] text-gym-secondary italic">Sin registros de peso aún</p>
      </div>
    )
  }

  // Calculate trend line end points (simple linear regression or just start to end)
  const trendLine = [
    { x: formattedData[0].dateStr, y: formattedData[0].weight },
    { x: formattedData[formattedData.length - 1].dateStr, y: formattedData[formattedData.length - 1].weight }
  ]

  return (
    <div className="h-[140px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={formattedData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          {/* Trend Line (Dashed) */}
          <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
          
          <XAxis 
            dataKey="dateStr" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#8A8A8A', fontSize: 10 }} 
            dy={10}
            hide={formattedData.length < 2}
          />
          <YAxis hide domain={['dataMin - 2', 'dataMax + 2']} />
          
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#141414', 
              border: '1px solid #262626', 
              borderRadius: '8px',
              fontSize: '11px',
              color: '#F0F0F0'
            }}
            itemStyle={{ color: '#5FA870' }}
            labelStyle={{ color: '#8A8A8A' }}
            formatter={(value) => [`${value} kg`]}
          />

          {/* Trend Line (Optional / Visual aid) */}
          <Line 
            data={formattedData}
            type="monotone" 
            dataKey="weight" 
            stroke="#5FA870" 
            strokeWidth={2} 
            dot={{ fill: '#5FA870', r: 4, stroke: '#0C0C0C', strokeWidth: 1 }}
            activeDot={{ r: 6, fill: '#5FA870', stroke: '#F0F0F0', strokeWidth: 2 }}
            animationDuration={1000}
          />
          
          {/* Regression Trend Line overlay if possible, otherwise simple dashed indicator */}
        </LineChart>
      </ResponsiveContainer>
      
      {/* Simple X labels for start and "HOY" as per reference */}
      <div className="flex justify-between px-2 mt-2">
        <span className="text-[9px] text-gym-secondary font-medium uppercase">
          {formattedData[0].dateStr}
        </span>
        <span className="text-[9px] text-gym-secondary font-medium uppercase">
          Hoy
        </span>
      </div>
    </div>
  )
}
