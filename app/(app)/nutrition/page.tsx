'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { MacroSummary } from '@/components/nutrition/MacroSummary'
import { createClient } from '@/lib/supabase/client'

const MEALS = ['Desayuno', 'Comida', 'Cena', 'Snacks']

export default function NutritionPage() {
  const [date, setDate] = useState(new Date())
  
  // Mock targets (these would come from Profile config)
  const targets = {
    calories: 2500,
    protein: 160,
    carbs: 280,
    fat: 80
  }

  // Mock current values
  const current = {
    calories: 1450,
    protein: 95,
    carbs: 150,
    fat: 45
  }

  const handlePrevDay = () => {
    const newDate = new Date(date)
    newDate.setDate(date.getDate() - 1)
    setDate(newDate)
  }

  const handleNextDay = () => {
    const newDate = new Date(date)
    newDate.setDate(date.getDate() + 1)
    setDate(newDate)
  }

  const dateLabel = new Intl.DateTimeFormat('es', { weekday: 'long', day: 'numeric', month: 'short' }).format(date)

  return (
    <div className="space-y-6">
      {/* Header / Date Navigation */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Nutrición</h1>
        <div className="flex items-center gap-2 rounded-lg bg-zinc-900 px-2 py-1">
          <button onClick={handlePrevDay} className="p-1 text-zinc-400 hover:text-zinc-100">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="w-28 text-center text-sm font-medium capitalize text-zinc-100">{dateLabel}</span>
          <button onClick={handleNextDay} className="p-1 text-zinc-400 hover:text-zinc-100">
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Momentos del día */}
      <div className="space-y-4">
        {MEALS.map(meal => (
          <div key={meal} className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-zinc-200">{meal}</h3>
              <button className="flex items-center gap-1 text-xs text-green-500 hover:text-green-400">
                <Plus className="h-4 w-4" /> Agregar
              </button>
            </div>
            {/* Si hubiera items, se mostrarían aquí. Por ahora está vacío. */}
            <p className="mt-2 text-sm text-zinc-500">Sin registros</p>
          </div>
        ))}
      </div>

      {/* Resumen de Macros */}
      <MacroSummary 
        calories={{ current: current.calories, target: targets.calories }}
        protein={{ current: current.protein, target: targets.protein }}
        carbs={{ current: current.carbs, target: targets.carbs }}
        fat={{ current: current.fat, target: targets.fat }}
      />
    </div>
  )
}
