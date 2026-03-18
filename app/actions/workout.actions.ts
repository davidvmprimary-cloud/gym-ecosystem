'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { sessionRepository } from '@/lib/repositories/session.repository'
import { prRepository } from '@/lib/repositories/pr.repository'
import { calculateVolume, calculateEstimated1RM } from '@/lib/utils/math'
import prisma from '@/lib/prisma/client'

const FinishSessionSchema = z.object({
  splitId: z.string().uuid(),
  durationMinutes: z.number().optional(),
  perceivedEffort: z.number().min(1).max(10).optional(),
  exercises: z.array(z.object({
    exerciseId: z.string().uuid(),
    sets: z.array(z.object({
      setNumber: z.number(),
      weightKg: z.number().nonnegative(),
      reps: z.number().positive().int(),
    }))
  }))
})

export async function finishWorkoutSession(input: z.infer<typeof FinishSessionSchema>) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const parsed = FinishSessionSchema.parse(input)

  // 1. Obtener sesión anterior del mismo split para calcular progreso
  const previousSession = await sessionRepository.getLastSessionBySplit(user.id, parsed.splitId)

  // 2. Preparar todos los sets con volumen calculado
  const allSets = parsed.exercises.flatMap(ex =>
    ex.sets.map(set => ({
      exerciseId: ex.exerciseId,
      setNumber: set.setNumber,
      weightKg: set.weightKg,
      reps: set.reps,
      volume: calculateVolume(set.weightKg, set.reps),
    }))
  )

  // 3. Calcular volumen total de la sesión
  const totalVolume = allSets.reduce((sum, s) => sum + s.volume, 0)

  // 4. Calcular % de progreso vs sesión anterior
  let progressPct = 0
  if (previousSession && previousSession.sets) {
    const prevVolume = previousSession.sets.reduce((sum, s) => sum + (s.volume || 0), 0)
    progressPct = prevVolume > 0 ? ((totalVolume - prevVolume) / prevVolume) * 100 : 0
  }

  // 5. Crear sesión en DB
  const session = await sessionRepository.createSession({
    user: { connect: { id: user.id } },
    split: { connect: { id: parsed.splitId } },
    durationMinutes: parsed.durationMinutes,
    perceivedEffort: parsed.perceivedEffort,
    totalVolume,
    progressPct,
    sets: { create: allSets }
  })

  // 6. Verificar PRs por cada set
  const prResults: Record<string, string[]> = {}
  for (const set of session.sets) {
    const estimated1rm = calculateEstimated1RM(set.weightKg, set.reps)
    const newPRs = await prRepository.checkAndRegisterPR({
      userId: user.id,
      exerciseId: set.exerciseId,
      setId: set.id,
      sessionId: session.id,
      weightKg: set.weightKg,
      reps: set.reps,
      volume: (set as any).volume || 0,
      estimated1rm,
    })
    if (newPRs.length > 0) {
      // Marcar el set como PR
      await prisma.set.update({ where: { id: set.id }, data: { isPersonalRecord: true } })
      prResults[set.exerciseId] = newPRs
    }
  }

  revalidatePath('/workout')
  revalidatePath('/history')

  return { sessionId: session.id, progressPct, newPRs: prResults }
}

export async function updateExerciseSettings(exerciseId: string, data: { improvementTarget?: number, color?: string | null, metadata?: any }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  await prisma.exercise.update({
    where: { id: exerciseId },
    data: {
      ...(data.improvementTarget !== undefined && { improvementTarget: data.improvementTarget }),
      ...(data.color !== undefined && { color: data.color }),
      ...(data.metadata !== undefined && { metadata: data.metadata }),
    }
  })

  revalidatePath('/workout')
}

export async function getNextSplit(userId: string) {
  const last = await sessionRepository.getLastTrainedSplit(userId)
  const splits = await prisma.split.findMany({
    where: { userId },
    orderBy: { order: 'asc' }
  })
  if (!last || !last.split) return splits[0]
  const lastSplitId = last.split.id
  const currentIndex = splits.findIndex(s => s.id === lastSplitId)
  return splits[(currentIndex + 1) % splits.length]
}

export async function updateUserPreferences(data: {
  defaultImprovementTarget?: number
  maxRestDays?: number
  targetCalories?: number
  targetProtein?: number
  targetCarbs?: number
  targetFat?: number
  weeklySchedule?: any
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  await prisma.user.update({
    where: { id: user.id },
    data
  })

  revalidatePath('/profile')
  revalidatePath('/nutrition')
}
