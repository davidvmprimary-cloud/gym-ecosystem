'use client'

import { useEffect } from 'react'
import { useWorkoutSession } from '@/lib/hooks/useWorkoutSession'
import { GlobalProgressRing } from './GlobalProgressRing'
import { ExerciseCard } from './ExerciseCard'

interface WorkoutSessionClientProps {
  split: any // We will type this properly later with Prisma types
  daysSinceLastSession: number
}

export function WorkoutSessionClient({ split, daysSinceLastSession }: WorkoutSessionClientProps) {
  const { isActive, splitId, startSession, finishSession } = useWorkoutSession()

  useEffect(() => {
    // If there is no active session, or it's a different split, ask or just start
    if (!isActive || splitId !== split.id) {
      startSession(split.id)
    }
  }, [isActive, splitId, split.id, startSession])

  const handleFinish = () => {
    finishSession()
    // redirect or show success
  }

  return (
    <>
      {daysSinceLastSession > 5 && (
        <div className="rounded-xl border border-yellow-900 bg-yellow-950/30 p-4 mb-6">
          <p className="text-sm text-yellow-500">
            Llevas {daysSinceLastSession} días sin entrenar. ¿Deseas continuar con {split.name} o reiniciar el ciclo?
          </p>
          <div className="mt-3 flex gap-3">
            <button className="rounded-lg bg-yellow-500 px-3 py-1.5 text-xs font-semibold text-yellow-950">
              Continuar
            </button>
            <button className="rounded-lg border border-yellow-900 px-3 py-1.5 text-xs font-semibold text-yellow-500">
              Reiniciar Ciclo
            </button>
          </div>
        </div>
      )}

      {/* The progress calculation goes here */}
      <div className="mb-6 flex flex-col items-center justify-center">
        <GlobalProgressRing progress={-1.5} /> {/* Mock value */}
      </div>

      <div className="space-y-4 mb-6">
        {split.exercises.map((exercise: any) => (
          <ExerciseCard key={exercise.id} exercise={exercise} />
        ))}
      </div>

      <button 
        onClick={handleFinish}
        className="w-full rounded-xl bg-green-500 py-4 text-center font-bold text-zinc-950 shadow-lg shadow-green-500/20 active:scale-[0.98] transition-all"
      >
        Guardar sesión
      </button>
    </>
  )
}
