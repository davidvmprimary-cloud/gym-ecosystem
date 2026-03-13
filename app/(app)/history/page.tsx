import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma/client'
import { redirect } from 'next/navigation'
import { VolumeChart } from '@/components/history/VolumeChart'
import { FrequencyHeatmap } from '@/components/history/FrequencyHeatmap'
import { WeightChart } from '@/components/history/WeightChart'
import { CalendarDays, TrendingUp, Trophy, ChevronRight, Flame } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { getBodyWeightHistory } from '@/app/actions/user.actions'
import { calculateCurrentStreak, calculateVolumeTrend } from '@/lib/utils/stats'

export default async function HistoryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Fetch real sessions
  const sessionsData = await prisma.session.findMany({
    where: { userId: user.id },
    include: { 
      split: true,
      sets: true
    },
    orderBy: { date: 'asc' }
  })

  // Cast to any to bypass Prisma Client type lag
  const sessions = sessionsData as any[]

  const weights = await getBodyWeightHistory()
  
  // Calculate Stats
  const sessionDates = sessions.map(s => s.date)
  const streak = calculateCurrentStreak(sessionDates)
  const volumeTrend = calculateVolumeTrend(sessions.map(s => ({ volume: s.totalVolume || 0, date: s.date })))
  
  const totalVolume = sessions.reduce((sum, s) => sum + (s.totalVolume || 0), 0)

  // Prepare chart data
  const volumeData = sessions.map(s => ({
    date: s.date.toISOString(),
    volume: s.totalVolume || 0,
    splitName: s.split?.name
  }))

  const recentSessions = [...sessions].reverse().slice(0, 10)

  return (
    <HistoryClient 
      initialSessions={sessions}
      weights={weights}
      streak={streak}
      totalVolume={totalVolume}
      volumeTrend={volumeTrend}
    />
  )
}
