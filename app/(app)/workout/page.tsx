import { PlusCircle } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma/client'
import { redirect } from 'next/navigation'
import { WorkoutSessionClient } from '@/components/workout/WorkoutSessionClient'

export default async function WorkoutPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const resolvedParams = await searchParams
  const dateStr = typeof resolvedParams?.date === 'string' ? resolvedParams.date : undefined
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Auto-heal / Ensure user exists
  let dbUser = null
  try {
    const { ensureUserExists } = await import('@/lib/auth/ensure-user')
    dbUser = await ensureUserExists(user.id, user.email!)
  } catch (e) {
    console.error('Error auto-healing user in WorkoutPage:', e)
  }

  // Fetch splits
  const splits = await prisma.split.findMany({
    where: { userId: user.id },
    orderBy: { order: 'asc' },
    include: { exercises: { orderBy: { order: 'asc' } } }
  })

  if (splits.length === 0) {
    return (
      <div className="flex min-h-[80vh] flex-col items-center justify-center p-6 text-center gap-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gym-primary">Sin rutinas</h2>
          <p className="text-gym-secondary text-sm max-w-[250px]">
            Aún no tienes splits configurados. Ve a tu perfil para crear tu primera rutina.
          </p>
        </div>
        <Link 
          href="/profile" 
          className="flex items-center gap-2 bg-gym-green-bg text-white px-6 py-3 rounded-gym font-semibold hover:bg-gym-green-accent transition-colors"
        >
          <PlusCircle className="w-5 h-5" />
          <span>Ir a Perfil</span>
        </Link>
      </div>
    )
  }

  // Find latest session
  const latestSession = await prisma.session.findFirst({
    where: { userId: user.id },
    orderBy: { date: 'desc' },
    include: { split: true }
  })

  let nextSplitIndex = 0
  let daysSinceLastSession = 0

  if (latestSession) {
    const latestSplitIndex = splits.findIndex((s: any) => s.id === latestSession.splitId)
    if (latestSplitIndex !== -1) {
      nextSplitIndex = (latestSplitIndex + 1) % splits.length
    }
    
    // Calculate days diff
    const diffTime = Math.abs(new Date().getTime() - latestSession.date.getTime())
    daysSinceLastSession = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  }

  let effectiveSplitIndex = nextSplitIndex
  
  let targetDate = new Date()
  if (dateStr) {
    targetDate = new Date(dateStr + 'T12:00:00')
  }

  const targetDateStart = new Date(targetDate)
  targetDateStart.setHours(0,0,0,0)
  const nextDay = new Date(targetDateStart)
  nextDay.setDate(targetDateStart.getDate() + 1)

  const sessionOnDate = await prisma.session.findFirst({
    where: { 
      userId: user.id,
      date: { gte: targetDateStart, lt: nextDay }
    },
    orderBy: { date: 'desc' },
    include: { split: true }
  })

  let todaySplit: any = null
  const weeklySchedule = (dbUser as any)?.weeklySchedule as Record<string, string | null> | null
  const dayOfWeek = targetDate.getDay().toString()

  if (sessionOnDate) {
    todaySplit = sessionOnDate.split
  } else {
    if (weeklySchedule && weeklySchedule[dayOfWeek] !== undefined) {
      const scheduledSplitId = weeklySchedule[dayOfWeek]
      if (scheduledSplitId === null) {
        todaySplit = null // Rest Day
      } else {
        todaySplit = splits.find(s => s.id === scheduledSplitId) || null
      }
    } else {
      const today = new Date();
      today.setHours(0,0,0,0);
      const diffDays = Math.round((targetDateStart.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      let effectiveSplitIndex = (nextSplitIndex + diffDays) % splits.length;
      if (effectiveSplitIndex < 0) effectiveSplitIndex += splits.length;
      todaySplit = splits[effectiveSplitIndex]
    }
  }
  const todayLabel = new Intl.DateTimeFormat('es', { weekday: 'long', day: 'numeric', month: 'short' }).format(targetDate)
  const currentDateISO = targetDate.toISOString().split('T')[0]

  return (
    <div className="min-h-screen bg-gym-black text-gym-primary">
      <WorkoutSessionClient 
        split={todaySplit} 
        daysSinceLastSession={daysSinceLastSession} 
        todayLabel={todayLabel} 
        currentDateStr={currentDateISO}
      />
    </div>
  )
}
