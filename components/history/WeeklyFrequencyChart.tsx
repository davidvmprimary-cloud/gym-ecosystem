'use client'

import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { format, startOfWeek, addDays } from 'date-fns'
import { es } from 'date-fns/locale'

export function WeeklyFrequencyChart({ sessions }: { sessions: { date: string | Date; splitName?: string }[] }) {
  // Construir los últimos 8 lunes con sus sesiones
  const weeks = Array.from({ length: 8 }, (_, i) => {
    const weekStart = startOfWeek(addDays(new Date(), -i * 7), { weekStartsOn: 1 })
    const weekSessions = sessions.filter(s => {
      const d = new Date(s.date)
      return d >= weekStart && d < addDays(weekStart, 7)
    })
    return {
      week: format(weekStart, 'dd MMM', { locale: es }),
      count: weekSessions.length,
    }
  }).reverse()

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
      <h3 className="text-sm text-zinc-400 mb-6">Frecuencia semanal</h3>
      <ResponsiveContainer width="100%" height={150}>
        <BarChart data={weeks} barSize={24}>
          <XAxis dataKey="week" tick={{ fontSize: 10, fill: '#71717a' }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ background: '#18181b', border: '1px solid #27272a', borderRadius: 12, color: '#f4f4f5' }}
            formatter={(v: any) => [`${v} sesiones`]}
            cursor={{ fill: '#27272a', opacity: 0.4 }}
          />
          <Bar dataKey="count" radius={[6, 6, 0, 0]}>
            {weeks.map((entry, i) => (
              <Cell key={i} fill={entry.count >= 3 ? '#22c55e' : entry.count >= 1 ? '#3f3f46' : '#27272a'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
