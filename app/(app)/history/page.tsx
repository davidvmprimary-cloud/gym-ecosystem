import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma/client'
import { redirect } from 'next/navigation'
import { VolumeChart } from '@/components/history/VolumeChart'
import { WeeklyFrequencyChart } from '@/components/history/WeeklyFrequencyChart'
import { WeightChart } from '@/components/history/WeightChart'
import { Calendar, TrendingDown } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { getBodyWeightHistory } from '@/app/actions/user.actions'

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

  // Fetch weights
  const weights = await getBodyWeightHistory()

  // Reversed sessions for history list
  const recentSessions = [...sessions].reverse().slice(0, 10)

  return (
    <div className="space-y-8 pb-10">
      <div className="flex justify-between items-end px-1">
        <div>
          <h1 className="text-[24px] font-bold text-gym-primary">Evolución</h1>
          <p className="text-[12px] text-gym-secondary mt-1">Tu progreso físico y de fuerza</p>
        </div>
        <div className="bg-gym-dark-2 px-3 py-1.5 rounded-full border border-gym-border flex items-center gap-2">
          <TrendingDown className="w-3.5 h-3.5 text-gym-green-accent" />
          <span className="text-[11px] font-medium text-gym-primary tabular-nums">
            {weights.length > 1 ? (weights[weights.length-1].weightKg - weights[0].weightKg).toFixed(1) : '0.0'} kg
          </span>
        </div>
      </div>

      <section className="bg-gym-dark-1 border border-gym-border rounded-[20px] p-6 shadow-sm">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-[14px] font-semibold text-gym-primary flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-gym-green-accent"></div>
            Peso Corporal
          </h2>
          <span className="text-[11px] text-gym-secondary tabular-nums italic">últimos {weights.length} registros</span>
        </div>
        <WeightChart data={weights} />
      </section>

      <section>
        <h2 className="text-[14px] font-semibold text-gym-primary px-1 mb-4">Volumen Global</h2>
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
