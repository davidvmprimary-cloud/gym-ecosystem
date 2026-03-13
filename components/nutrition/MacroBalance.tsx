'use client'

import { useNutritionStore } from '@/lib/stores/nutrition.store'

interface MacroBalanceProps {
  goals: {
    calories: number
    protein: number
    carbs: number
    fat: number
  }
}

export function MacroBalance({ goals }: MacroBalanceProps) {
  const totals = useNutritionStore(s => s.getDailyTotals())

  const macros = [
    { label: 'Proteína', current: totals.proteinG, goal: goals.protein, unit: 'g', color: '#3b82f6' },
    { label: 'Carbos', current: totals.carbsG, goal: goals.carbs, unit: 'g', color: '#f59e0b' },
    { label: 'Grasa', current: totals.fatG, goal: goals.fat, unit: 'g', color: '#ec4899' },
  ]

  const caloriePct = Math.min(100, (totals.calories / goals.calories) * 100)
  const remainingCals = Math.round(goals.calories - totals.calories)

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 space-y-6">
      {/* Calorías principales */}
      <div className="flex justify-between items-end">
        <div>
          <p className="text-4xl font-bold tabular-nums text-zinc-100">{totals.calories}</p>
          <p className="text-zinc-500 text-sm">de {goals.calories} kcal</p>
        </div>
        <p className="text-zinc-400 text-sm">{remainingCals} restantes</p>
      </div>

      <div className="h-2.5 bg-zinc-800 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${caloriePct}%`, backgroundColor: caloriePct > 100 ? '#ef4444' : '#22c55e' }}
        />
      </div>

      {/* Macros */}
      <div className="grid grid-cols-3 gap-6 pt-4 border-t border-zinc-800/50">
        {macros.map(macro => (
          <MacroBar key={macro.label} {...macro} />
        ))}
      </div>
    </div>
  )
}

interface MacroBarProps {
  label: string;
  current: number;
  goal: number;
  unit: string;
  color: string;
}

function MacroBar({ label, current, goal, unit, color }: MacroBarProps) {
  const pct = Math.min(100, goal > 0 ? (current / goal) * 100 : 0)
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs mb-1">
        <span className="text-zinc-400">{label}</span>
      </div>
      <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <p className="text-sm font-semibold tabular-nums text-zinc-200">
        {Math.round(current)}<span className="text-zinc-500 font-normal">/{goal}{unit}</span>
      </p>
    </div>
  )
}
