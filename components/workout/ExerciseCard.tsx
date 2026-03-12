'use client'

import { useWorkoutSession } from '@/lib/hooks/useWorkoutSession'
import { useState } from 'react'
import { suggestNextSet } from '@/lib/utils/suggestions'
import { Plus, Check, Circle } from 'lucide-react'
import clsx from 'clsx'

export function ExerciseCard({ exercise }: { exercise: any }) {
  const { sets, addSet } = useWorkoutSession()
  const exerciseSets = sets.filter(s => s.exerciseId === exercise.id)

  const [weight, setWeight] = useState('')
  const [reps, setReps] = useState('')

  // Placeholder target logic
  const improvementTarget = exercise.improvementTarget || 2.5
  
  // Suggestion logic (mocking old volume for now)
  const suggestion = suggestNextSet({
    completedSetsVolume: exerciseSets.reduce((acc, s) => acc + (s.weightKg * s.reps), 0),
    previousSessionTotalVolume: 1500, // mock
    improvementTargetRatio: improvementTarget / 100,
    remainingSets: 3 - exerciseSets.length
  })

  // Derive progress vs target
  const progressPercent = 3.2 // mock value

  const handleAddSet = () => {
    if (!weight || !reps) return
    addSet({
      id: crypto.randomUUID(),
      exerciseId: exercise.id,
      reps: parseInt(reps),
      weightKg: parseFloat(weight)
    })
    setWeight('')
    setReps('')
  }

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold">{exercise.name}</h3>
          <button className="text-[10px] text-green-500 opacity-80 hover:opacity-100 flex items-center gap-1">
            Target: +{improvementTarget}% [editar]
          </button>
        </div>
        <div className={clsx(
          "text-sm font-medium",
          progressPercent >= improvementTarget ? "text-green-500" : progressPercent > 0 ? "text-yellow-500" : "text-red-500"
        )}>
          {progressPercent > 0 ? '+' : ''}{progressPercent}% ↑
        </div>
      </div>
      
      <div className="space-y-3">
        {exerciseSets.map((s, idx) => (
          <div key={s.id} className="flex items-center gap-3">
            <span className="w-12 text-sm text-zinc-400 text-right">Set {idx + 1}</span>
            <div className="w-20 rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-center text-sm text-zinc-300">
              {s.weightKg}
            </div>
            <span className="text-sm text-zinc-500">kg</span>
            <div className="w-20 rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-center text-sm text-zinc-300">
              {s.reps}
            </div>
            <span className="text-sm text-zinc-500">reps</span>
            <Check className="h-4 w-4 text-green-500 ml-auto" />
          </div>
        ))}

        {/* Current input set */}
        <div className="flex items-center gap-3">
          <span className="w-12 text-sm text-zinc-400 text-right">Set {exerciseSets.length + 1}</span>
          <input 
            type="number" 
            inputMode="decimal" 
            placeholder={suggestion.suggestedWeightKg.toString() || "0"} 
            value={weight}
            onChange={e => setWeight(e.target.value)}
            className="w-20 rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-center text-sm focus:border-green-500 focus:outline-none" 
          />
          <span className="text-sm text-zinc-500">kg</span>
          <input 
            type="number" 
            inputMode="numeric" 
            placeholder={suggestion.suggestedReps.toString() || "0"} 
            value={reps}
            onChange={e => setReps(e.target.value)}
            className="w-20 rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-center text-sm focus:border-green-500 focus:outline-none" 
          />
          <span className="text-sm text-zinc-500">reps</span>
          <Circle className="h-4 w-4 text-zinc-600 ml-auto" />
        </div>
      </div>

      <button 
        onClick={handleAddSet}
        className="mt-4 flex items-center gap-1 text-sm text-green-500 hover:text-green-400 font-medium"
      >
        <Plus className="h-4 w-4" /> Agregar set
      </button>
    </div>
  )
}
