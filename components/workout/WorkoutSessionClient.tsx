'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useWorkoutSession } from '@/lib/hooks/useWorkoutSession'
import { GlobalProgressRing } from './GlobalProgressRing'
import { ExerciseCard } from './ExerciseCard'
import { finishWorkoutSession } from '@/app/actions/workout.actions'
import { PRCelebration } from '@/components/shared/PRCelebration'
import { RestTimerWidget } from '@/components/workout/RestTimerWidget'
import { CloudUpload } from 'lucide-react'

interface WorkoutSessionClientProps {
  split: any // Prisma type
  daysSinceLastSession: number
  todayLabel: string
}

export function WorkoutSessionClient({ split, daysSinceLastSession, todayLabel }: WorkoutSessionClientProps) {
  const router = useRouter()
  const { isActive, splitId, startSession, finishSession, sets, draftSets } = useWorkoutSession()
  const [prTypes, setPrTypes] = useState<string[]>([])
  const [showPR, setShowPR] = useState(false)
  const [isFinishing, setIsFinishing] = useState(false)

  useEffect(() => {
    if (!isActive || splitId !== split.id) {
      startSession(split.id)
    }
  }, [isActive, splitId, split.id, startSession])

  const handleFinish = async () => {
    if (isFinishing) return
    setIsFinishing(true)

    try {
      const hybridSets = [...sets]
      for (const [exId, draft] of Object.entries(draftSets)) {
        if (draft.weightKg > 0 && draft.reps > 0) {
          hybridSets.push({ id: crypto.randomUUID(), exerciseId: exId, weightKg: draft.weightKg, reps: draft.reps })
        }
      }

      const grouped = hybridSets.reduce((acc, set) => {
        if (!acc[set.exerciseId]) {
          acc[set.exerciseId] = { exerciseId: set.exerciseId, sets: [] }
        }
        acc[set.exerciseId].sets.push({
          setNumber: acc[set.exerciseId].sets.length + 1,
          weightKg: set.weightKg,
          reps: set.reps,
        })
        return acc
      }, {} as Record<string, { exerciseId: string; sets: { setNumber: number; weightKg: number; reps: number }[] }>)

      const payload = {
        splitId: split.id,
        exercises: Object.values(grouped),
      }

      const result = await finishWorkoutSession(payload)

      if (Object.keys(result.newPRs).length > 0) {
        const allTypes = Object.values(result.newPRs).flat()
        const uniqueTypes = Array.from(new Set(allTypes))
        
        setPrTypes(uniqueTypes)
        setShowPR(true)
      } else {
        finishSession()
        router.push('/history')
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsFinishing(false)
    }
  }

  const handlePrComplete = () => {
    setShowPR(false)
    finishSession()
    router.push('/history')
  }

  // Count exercises with at least one set completed
  const completedExercises = new Set(sets.map(s => s.exerciseId)).size
  const draftList = Object.values(draftSets).filter(d => d.weightKg > 0 && d.reps > 0)
  const unsavedCount = draftList.length
  const totalSetsCount = sets.length + unsavedCount

  return (
    <>
      <PRCelebration isVisible={showPR} prTypes={prTypes} onComplete={handlePrComplete} />
      <RestTimerWidget />

      <header className="sticky top-0 z-50 bg-gym-black border-b border-gym-border px-4 flex items-center justify-between h-16">
        <div className="flex flex-col">
          <span className="text-[11px] text-gym-secondary font-semibold uppercase tracking-wider">{todayLabel}</span>
          <h1 className="text-[14px] font-bold text-gym-green-accent uppercase">{split.name}</h1>
        </div>
        <button 
          onClick={handleFinish} 
          disabled={isFinishing || totalSetsCount === 0}
          className="w-[80px] h-[34px] bg-gym-green-bg rounded-gym-pill flex items-center justify-center gap-1 text-[13px] font-semibold text-white disabled:opacity-50"
        >
          <CloudUpload className="w-4 h-4" />
          Guardar
        </button>
      </header>

      <main>
        {daysSinceLastSession > 5 && (
          <div className="mx-4 mt-4 rounded-xl border border-yellow-900 bg-yellow-950/30 p-4">
            <p className="text-sm text-yellow-500">
              Llevas {daysSinceLastSession} días sin entrenar. ¿Deseas continuar con {split.name} o reiniciar el ciclo?
            </p>
          </div>
        )}

        {/* Global Progress Hero */}
        <GlobalProgressRing progress={+4.2} completed={completedExercises} total={split.exercises?.length || 0} />

        <section className="bg-gym-black">
          {split.exercises.map((exercise: any, idx: number) => (
            <ExerciseCard key={exercise.id} exercise={exercise} isEven={idx % 2 !== 0} />
          ))}
        </section>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 p-4 bg-gym-black/80 backdrop-blur-md border-t border-gym-border z-50 pb-safe">
        <button 
          onClick={handleFinish} 
          disabled={isFinishing || totalSetsCount === 0} 
          className="w-full h-14 bg-gym-green-bg rounded-gym flex flex-col items-center justify-center relative disabled:opacity-50"
        >
          <div className="flex items-center gap-2">
            <CloudUpload className="w-5 h-5 text-white" />
            <span className="text-[15px] font-semibold text-white">{isFinishing ? 'Guardando...' : 'Guardar Sesión'}</span>
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="w-1.5 h-1.5 bg-gym-green-bright rounded-full pulse-dot"></span>
            <span className="text-[11px] text-white/80">
              {totalSetsCount} series listas {unsavedCount > 0 && `(${unsavedCount} drafts)`}
            </span>
          </div>
        </button>
        {/* iOS Home Indicator Spacer if needed */}
        <div className="h-4"></div>
      </footer>
    </>
  )
}
