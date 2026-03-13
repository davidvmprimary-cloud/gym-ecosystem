import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma/client'
import { redirect } from 'next/navigation'
import { WorkoutSessionClient } from '@/components/workout/WorkoutSessionClient'

export default async function WorkoutPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Fetch splits
  const splits = await prisma.split.findMany({
    where: { userId: user.id },
    orderBy: { order: 'asc' },
    include: { exercises: { orderBy: { order: 'asc' } } }
  })

  if (splits.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-6 text-center">
        <h2 className="text-xl font-bold">Sin rutinas</h2>
        <p className="mt-2 text-zinc-400">Ve a Perfil para configurar tus splits de entrenamiento.</p>
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

  const todaySplit = splits[nextSplitIndex]
  const todayLabel = new Intl.DateTimeFormat('es', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date())

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold capitalize text-green-500">{todaySplit.name}</h1>
        <p className="text-sm text-zinc-400 capitalize">{todayLabel}</p>
      </div>

      <WorkoutSessionClient split={todaySplit} daysSinceLastSession={daysSinceLastSession} />
    </div>
  )
}
