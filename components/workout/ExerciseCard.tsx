'use client'

import { useWorkoutSession } from '@/lib/hooks/useWorkoutSession'
import { useState } from 'react'
import { suggestNextSet } from '@/lib/utils/suggestions'
import { Check, Settings2, Circle } from 'lucide-react'
import clsx from 'clsx'
import { motion } from 'framer-motion'
import { ExerciseSettingsDrawer } from './ExerciseSettingsDrawer'
import { updateExerciseTarget } from '@/app/actions/workout.actions'

export function ExerciseCard({ exercise, isEven = false }: { exercise: any; isEven?: boolean }) {
  const { sets, draftSets, updateDraft, commitDraft } = useWorkoutSession()
  const exerciseSets = sets.filter(s => s.exerciseId === exercise.id)
  
  const draft = draftSets[exercise.id] || { weightKg: 0, reps: 0 }
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  const improvementTarget = exercise.improvementTarget || 2.5
  
  const suggestion = suggestNextSet({
    completedSetsVolume: exerciseSets.reduce((acc, s) => acc + (s.weightKg * s.reps), 0),
    previousSessionTotalVolume: 1500, // mock
    improvementTargetRatio: improvementTarget / 100,
    remainingSets: 3 - exerciseSets.length
  })

  const progressPercent = 3.2 // mock value

  const handleAddSet = () => {
    if (!draft.weightKg || !draft.reps) return
    commitDraft(exercise.id)
  }

  const handleSaveTarget = async (newTarget: number) => {
    await updateExerciseTarget(exercise.id, newTarget)
  }
  
  return (
    <article className={clsx("p-4 mb-px transition-colors relative", isEven ? "bg-gym-dark-2" : "bg-gym-dark-1")}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-[16px] font-semibold text-gym-primary">{exercise.name}</h2>
          <span className="bg-[#3D6B4720] text-gym-green-bright text-[11px] font-bold px-2 py-0.5 rounded-gym-pill">
            +{progressPercent}%
          </span>
        </div>
        <button 
          onClick={() => setIsSettingsOpen(true)}
          className="text-gym-secondary hover:text-white transition-colors"
        >
          <Settings2 className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-2 mb-4">
        {exerciseSets.map((s, idx) => (
          <div key={s.id} className="flex items-center gap-3 h-12">
            <div className="flex-1 bg-gym-dark-3 border-l-4 border-gym-green-accent rounded-r-[4px] h-full flex items-center px-3 justify-between">
              <span className="tabular-nums text-[22px] font-bold text-gym-primary">
                {s.weightKg} <span className="text-[14px] font-normal text-gym-secondary">kg</span>
              </span>
              <span className="tabular-nums text-[22px] font-bold text-gym-primary">
                {s.reps} <span className="text-[14px] font-normal text-gym-secondary">reps</span>
              </span>
            </div>
            <div className="w-12 h-12 bg-gym-green-accent rounded-gym flex items-center justify-center">
              <Check className="text-white w-6 h-6 stroke-[3px]" />
            </div>
          </div>
        ))}

        {/* Current Set Input */}
        <div className="flex items-center gap-3 h-12">
          <div className="flex-1 bg-gym-dark-2 border-l-4 border-gym-muted rounded-r-[4px] h-full flex items-center px-3 justify-between">
            <div className="flex items-center gap-3 w-full">
              <div className="flex flex-col w-1/2">
                <input
                  type="number"
                  inputMode="decimal"
                  placeholder={suggestion.suggestedWeightKg?.toString() || "0"}
                  value={draft.weightKg || ''}
                  onChange={e => updateDraft(exercise.id, parseFloat(e.target.value) || 0, draft.reps)}
                  className="w-full bg-transparent text-[22px] font-bold text-gym-primary tabular-nums focus:outline-none placeholder-gym-muted/50 p-0 border-none"
                />
                <span className="text-[10px] text-gym-secondary -mt-1">KG</span>
              </div>
              <div className="h-6 w-px bg-gym-border"></div>
              <div className="flex flex-col w-1/2 items-end">
                <input
                  type="number"
                  inputMode="numeric"
                  placeholder={suggestion.suggestedReps?.toString() || "0"}
                  value={draft.reps || ''}
                  onChange={e => updateDraft(exercise.id, draft.weightKg, parseInt(e.target.value) || 0)}
                  className="w-full bg-transparent text-[22px] font-bold text-gym-primary tabular-nums text-right focus:outline-none placeholder-gym-muted/50 p-0 border-none"
                />
                <span className="text-[10px] text-gym-secondary -mt-1">REPS</span>
              </div>
            </div>
          </div>
          <button 
            onClick={handleAddSet}
            disabled={!draft.weightKg || !draft.reps}
            className="w-12 h-12 border-2 border-gym-muted border-dashed rounded-gym flex items-center justify-center hover:bg-gym-dark-3 transition-colors disabled:opacity-50"
          >
            {draft.weightKg && draft.reps ? (
              <Check className="text-gym-green-accent w-6 h-6 stroke-[3px]" />
            ) : (
              <span className="text-gym-muted text-[12px] font-bold">{exerciseSets.length + 1}</span>
            )}
          </button>
        </div>
      </div>

      <ExerciseSettingsDrawer 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        exerciseName={exercise.name}
        currentImprovementTarget={improvementTarget}
        onSave={handleSaveTarget}
      />
    </article>
  )
}
