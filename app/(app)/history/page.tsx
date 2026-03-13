import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma/client'
import { redirect } from 'next/navigation'
import { ProgressChart } from '@/components/history/ProgressChart'
import { Calendar } from 'lucide-react'

export default async function HistoryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Mocking some data for the global progress chart
  const mockChartData = [
    { date: '1 Mar', volume: 1500 },
    { date: '3 Mar', volume: 1540 },
    { date: '5 Mar', volume: 1600 },
    { date: '8 Mar', volume: 1625 },
    { date: '10 Mar', volume: 1700 }
  ]

  // Mock sessions
  const mockSessions = [
    { id: '1', date: new Date(), split: { name: 'Push' }, totalVolume: 1700 },
    { id: '2', date: new Date(Date.now() - 86400000 * 2), split: { name: 'Legs' }, totalVolume: 2100 },
    { id: '3', date: new Date(Date.now() - 86400000 * 4), split: { name: 'Pull' }, totalVolume: 1600 },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Progreso</h1>
        <p className="text-sm text-zinc-400">Analiza tu evolución</p>
      </div>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-zinc-200">Volumen Global</h2>
        <ProgressChart data={mockChartData} />
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-zinc-200">Historial de Sesiones</h2>
        <div className="space-y-3">
          {mockSessions.map((session) => (
            <div key={session.id} className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900 p-4 active:scale-[0.98] transition-all cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-800 text-green-500">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium text-zinc-100">{session.split.name}</h3>
                  <p className="text-xs text-zinc-400">
                    {new Intl.DateTimeFormat('es', { day: 'numeric', month: 'short' }).format(session.date)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-zinc-100">{session.totalVolume} kg</p>
                <p className="text-[10px] text-zinc-500">Volumen</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
