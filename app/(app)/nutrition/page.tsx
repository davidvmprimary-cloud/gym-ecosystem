'use client'

import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { MacroBalance } from '@/components/nutrition/MacroBalance'
import { useNutritionStore } from '@/lib/stores/nutrition.store'
import { getDailyNutrition, logNutritionEntry } from '@/app/actions/nutrition.actions'
import { LogMealDrawer } from '@/components/nutrition/LogMealDrawer'
import { useSync } from '@/hooks/useSync'
import { db } from '@/lib/db/local-db'

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
  const [isLogMealOpen, setIsLogMealOpen] = useState(false)
  const [selectedMealType, setSelectedMealType] = useState('breakfast')
  const { isOnline, addPendingAction } = useSync()
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => { setMounted(true) }, [])
  
  // Use state for local date object to format it easily
  const dateObj = new Date(selectedDate)

  useEffect(() => {
    async function loadData() {
      // 1. Try to load from Local Cache first (Fast UI)
      const cached = await db.cachedNutrition.get(selectedDate)
      if (cached) {
        setEntries(cached.entries)
      }

      if (isOnline) {
        try {
          const data = await getDailyNutrition(selectedDate)
          const mapped = data.map(d => ({
            id: d.id,
            mealType: (d.notes?.split(':')[0] as any) || 'snack',
            foodName: d.notes?.split(':')[1]?.trim() || 'Comida',
            calories: d.calories,
            proteinG: d.proteinG,
            carbsG: d.carbsG,
            fatG: d.fatG
          }))
          setEntries(mapped)
          // Update Cache
          await db.cachedNutrition.put({
            date: selectedDate,
            entries: mapped,
            updatedAt: Date.now()
          })
        } catch (e) {
          console.error(e)
        }
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

  const handleAddClick = (mealType: string) => {
    setSelectedMealType(mealType)
    setIsLogMealOpen(true)
  }

  const handleSaveSuccess = async (mappedEntry: any) => {
    // 1. Update store for Optimistic UI
    useNutritionStore.getState().addEntry(mappedEntry)
    
    // 2. Update local cache immediately
    const currentEntries = useNutritionStore.getState().entries
    await db.cachedNutrition.put({
      date: selectedDate,
      entries: currentEntries,
      updatedAt: Date.now()
    })

    // 3. If offline, queue the sync
    if (!isOnline) {
      // Reconstruct payload for syncing
      const payload = {
        date: new Date(selectedDate).toISOString(),
        mealType: mappedEntry.mealType,
        foodName: mappedEntry.foodName,
        calories: mappedEntry.calories,
        proteinG: mappedEntry.proteinG,
        carbsG: mappedEntry.carbsG,
        fatG: mappedEntry.fatG
      }
      await addPendingAction('SYNC_NUTRITION', payload)
    }
  }

  if (!mounted) return null // Prevent hydration mismatch

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
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-[14px] font-bold text-gym-primary">{MEAL_LABELS[meal]}</h3>
                <button 
                  onClick={() => handleAddClick(meal)}
                  className="flex items-center gap-1 text-[11px] font-medium text-gym-green-accent"
                >  <Plus className="h-4 w-4" /> Agregar
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
      {/* Modals */}
      <LogMealDrawer 
        isOpen={isLogMealOpen}
        onClose={() => setIsLogMealOpen(false)}
        mealType={selectedMealType}
        selectedDate={selectedDate}
        onSaveSuccess={handleSaveSuccess}
      />
    </div>
  )
}
