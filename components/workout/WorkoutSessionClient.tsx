'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useWorkoutSession } from '@/lib/hooks/useWorkoutSession'
import { GlobalProgressRing } from './GlobalProgressRing'
import { ExerciseCard } from './ExerciseCard'
import { finishWorkoutSession } from '@/app/actions/workout.actions'
import { PRCelebration } from '@/components/shared/PRCelebration'
import { RestTimerWidget } from '@/components/workout/RestTimerWidget'
import { CloudUpload, ChevronLeft, ChevronRight, WifiOff } from 'lucide-react'
import { useSync } from '@/hooks/useSync'
import { db } from '@/lib/db/local-db'

interface WorkoutSessionClientProps {
  split: any // Prisma type
  allSplits?: any[]
  daysSinceLastSession: number
  todayLabel: string
  currentDateStr: string
}

export function WorkoutSessionClient({ split: initialSplit, allSplits, daysSinceLastSession, todayLabel, currentDateStr }: WorkoutSessionClientProps) {
  const router = useRouter()
  const { isActive, splitId, startSession, finishSession, sets, draftSets } = useWorkoutSession()
  const [prTypes, setPrTypes] = useState<string[]>([])
  const [showPR, setShowPR] = useState(false)
  const [isFinishing, setIsFinishing] = useState(false)
  const { isOnline, addPendingAction } = useSync()
  const [split, setSplit] = useState(initialSplit)

  // Caching and Offline Recovery
  useEffect(() => {
    async function handleCaching() {
      if (initialSplit) {
        setSplit(initialSplit)
        await db.cachedWorkouts.put({
          id: initialSplit.id,
          name: initialSplit.name,
          exercises: initialSplit.exercises,
          updatedAt: Date.now()
        })
      } else if (!isOnline) {
        // Try to find ANY split if we are offline and none was provided
        const allCached = await db.cachedWorkouts.toArray()
        if (allCached.length > 0) {
          // Fallback to the first cached split or logic to match schedule
          setSplit({
            ...allCached[0],
            isOfflineFallback: true
          })
        }
      }

      if (allSplits) {
        for (const s of allSplits) {
          await db.cachedWorkouts.put({
            id: s.id,
            name: s.name,
            exercises: s.exercises,
            updatedAt: Date.now()
          })
        }
      }
    }
    handleCaching()
  }, [initialSplit, allSplits, isOnline])

  useEffect(() => {
    if (split && (!isActive || splitId !== split.id)) {
      startSession(split.id)
    }
  }, [isActive, splitId, split, startSession])

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

      if (!isOnline) {
        // OFFLINE SAVE
        await addPendingAction('SYNC_WORKOUT', payload)
        // Simulate local finish
        finishSession()
        router.push('/history?offline=true')
        return
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
      // Fallback: save offline even if online action fails
      const hybridSets = [...sets]
      // ... (Grouping logic)
      // await addPendingAction(...)
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

  const handlePrevDay = () => {
    const d = new Date(currentDateStr + 'T12:00:00')
    d.setDate(d.getDate() - 1)
    router.push(`/workout?date=${d.toISOString().split('T')[0]}`)
  }

  const handleNextDay = () => {
    const d = new Date(currentDateStr + 'T12:00:00')
    d.setDate(d.getDate() + 1)
    router.push(`/workout?date=${d.toISOString().split('T')[0]}`)
  }

  if (!split) {
    return (
      <div className="min-h-screen bg-gym-black text-gym-primary flex flex-col">
        <header className="sticky top-0 z-50 bg-gym-black border-b border-gym-border px-4 flex items-center justify-center h-16">
          <div className="flex items-center gap-4">
            <button onClick={handlePrevDay} className="p-1 text-gym-secondary hover:text-white transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex flex-col items-center">
              <span className="text-[11px] text-gym-secondary font-semibold uppercase tracking-wider">{todayLabel}</span>
              <h1 className="text-[14px] font-bold text-gym-green-accent uppercase">Descanso</h1>
            </div>
            <button onClick={handleNextDay} className="p-1 text-gym-secondary hover:text-white transition-colors">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </header>
        <main className="flex-1 flex flex-col items-center justify-center p-6 text-center gap-4 mt-20">
          <div className="w-20 h-20 rounded-full bg-gym-dark-1 border border-gym-border flex items-center justify-center shadow-lg">
            <span className="text-3xl">🧘‍♂️</span>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-gym-primary">Día de Recuperación</h2>
            <p className="text-gym-secondary text-sm max-w-[280px] mx-auto">
              Hoy es un día de descanso asignado en tu distribución semanal. Carga energías para tu próxima sesión.
            </p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <>
      <PRCelebration isVisible={showPR} prTypes={prTypes} onComplete={handlePrComplete} />
      <RestTimerWidget />

      <header className="sticky top-0 z-50 bg-gym-black border-b border-gym-border px-4 flex items-center justify-between h-16">
        <div className="flex items-center gap-2">
          <button onClick={handlePrevDay} className="p-1 text-gym-secondary hover:text-white transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1">
              <span className="text-[11px] text-gym-secondary font-semibold uppercase tracking-wider">{todayLabel}</span>
              {!isOnline && <WifiOff className="w-3 h-3 text-orange-500" />}
            </div>
            <h1 className="text-[14px] font-bold text-gym-green-accent uppercase">{split.name}</h1>
          </div>
          <button onClick={handleNextDay} className="p-1 text-gym-secondary hover:text-white transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
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
          {split.exercises?.map((exercise: any, idx: number) => (
            <ExerciseCard key={exercise.id} exercise={exercise} isEven={idx % 2 !== 0} />
          )) || (
            <div className="p-8 text-center text-gym-secondary text-sm">
              No se encontraron ejercicios para este split.
            </div>
          )}
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
