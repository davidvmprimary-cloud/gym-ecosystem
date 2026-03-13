import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma/client'
import { redirect } from 'next/navigation'
import { VolumeChart } from '@/components/history/VolumeChart'
import { WeeklyFrequencyChart } from '@/components/history/WeeklyFrequencyChart'
import { Calendar } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export default async function HistoryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Fetch real sessions
  const sessions = await prisma.session.findMany({
    where: { userId: user.id },
    include: { split: true },
    orderBy: { date: 'asc' }
  })

  // Prepare volume data for AreaChart
  const volumeData = sessions.map(s => ({
    date: s.date.toISOString(),
    volume: s.totalVolume || 0,
    progressPct: s.progressPct || 0
  }))

  // Prepare frequency data
  const frequencyData = sessions.map(s => ({
    date: s.date.toISOString(),
    splitName: s.split?.name
  }))

  // Reversed sessions for history list
  const recentSessions = [...sessions].reverse().slice(0, 10)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Progreso</h1>
        <p className="text-sm text-zinc-400">Analiza tu evolución</p>
      </div>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-zinc-200">Volumen Global</h2>
        {volumeData.length > 0 ? (
          <VolumeChart data={volumeData} />
        ) : (
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 text-center text-zinc-500 text-sm">
            Aún no hay datos suficientes para mostrar el gráfico.
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-zinc-200">Frecuencia de Entrenamiento</h2>
        <WeeklyFrequencyChart sessions={frequencyData} />
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-zinc-200">Historial de Sesiones</h2>
        {recentSessions.length > 0 ? (
          <div className="space-y-3">
            {recentSessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900 p-4 active:scale-[0.98] transition-all cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-800 text-green-500">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium text-zinc-100">{session.split?.name || 'Sesión'}</h3>
                    <p className="text-xs text-zinc-400">
                      {format(new Date(session.date), 'dd MMM yyyy', { locale: es })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-zinc-100">{Math.round(session.totalVolume || 0)} kg</p>
                  <p className="text-[10px] text-zinc-500">Volumen</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-zinc-500">No hay sesiones registradas.</p>
        )}
      </section>
    </div>
  )
}
