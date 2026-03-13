'use client'

import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { MacroBalance } from '@/components/nutrition/MacroBalance'
import { useNutritionStore } from '@/lib/stores/nutrition.store'
import { getDailyNutrition, logNutritionEntry } from '@/app/actions/nutrition.actions'

const MEALS = ['breakfast', 'lunch', 'dinner', 'snack'] as const
const MEAL_LABELS: Record<string, string> = {
  breakfast: 'Desayuno',
  lunch: 'Comida',
  dinner: 'Cena',
  snack: 'Snacks'
}

export default function NutritionPage() {
  const { selectedDate, setDate, entries, setEntries } = useNutritionStore()
  const [targets, setTargets] = useState({ calories: 2500, protein: 160, carbs: 280, fat: 80 })
  
  // Use state for local date object to format it easily
  const dateObj = new Date(selectedDate)

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getDailyNutrition(selectedDate)
        // map data to NutritionEntry
        setEntries(data.map(d => ({
          id: d.id,
          mealType: (d.notes?.split(':')[0] as any) || 'snack',
          foodName: d.notes?.split(':')[1]?.trim() || 'Comida',
          calories: d.calories,
          proteinG: d.proteinG,
          carbsG: d.carbsG,
          fatG: d.fatG
        })))
      } catch (e) {
        console.error(e)
      }
    }
    async function loadUserTargets() {
      try {
        const response = await fetch('/api/user/preferences')
        if (response.ok) {
          const user = await response.json()
          setTargets({
            calories: user.targetCalories,
            protein: user.targetProtein,
            carbs: user.targetCarbs,
            fat: user.targetFat
          })
        }
      } catch (e) {
        console.error("Failed to load targets", e)
      }
    }
    loadData()
    loadUserTargets()
  }, [selectedDate, setEntries])

  const handlePrevDay = () => {
    const newDate = new Date(dateObj)
    newDate.setDate(dateObj.getDate() - 1)
    setDate(newDate.toISOString().split('T')[0])
  }

  const handleNextDay = () => {
    const newDate = new Date(dateObj)
    newDate.setDate(dateObj.getDate() + 1)
    setDate(newDate.toISOString().split('T')[0])
  }

  const handleAdd = async (mealType: string) => {
    // Quick mock add for demonstration
    const entry = {
      date: new Date(selectedDate).toISOString(),
      mealType: mealType as any,
      foodName: 'Pollo con arroz',
      calories: 450,
      proteinG: 40,
      carbsG: 50,
      fatG: 10
    }
    
    // Optimistic UI update could go here
    const saved = await logNutritionEntry(entry)
    
    // reload data or just append
    const mapped = {
      id: saved.id,
      mealType: (saved.notes?.split(':')[0] as any) || mealType,
      foodName: saved.notes?.split(':')[1]?.trim() || entry.foodName,
      calories: saved.calories,
      proteinG: saved.proteinG,
      carbsG: saved.carbsG,
      fatG: saved.fatG
    }
    useNutritionStore.getState().addEntry(mapped)
  }

  const dateLabel = new Intl.DateTimeFormat('es', { weekday: 'long', day: 'numeric', month: 'short' }).format(dateObj)

  return (
    <div className="space-y-6">
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

      <MacroBalance goals={targets} />

      <div className="space-y-4">
        {MEALS.map(meal => {
          const mealEntries = entries.filter(e => e.mealType === meal)
          return (
            <div key={meal} className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-zinc-200">{MEAL_LABELS[meal]}</h3>
                <button onClick={() => handleAdd(meal)} className="flex items-center gap-1 text-xs text-green-500 hover:text-green-400">
                  <Plus className="h-4 w-4" /> Agregar
                </button>
              </div>
              
              {mealEntries.length === 0 ? (
                <p className="mt-2 text-sm text-zinc-500">Sin registros</p>
              ) : (
                <div className="space-y-2 mt-3">
                  {mealEntries.map(e => (
                    <div key={e.id} className="flex justify-between items-center text-sm">
                      <span className="text-zinc-300">{e.foodName}</span>
                      <span className="text-zinc-400 font-medium tabular-nums">{e.calories} kcal</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
