'use client'

import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, Plus, Check } from 'lucide-react'
import { MacroBalance } from '@/components/nutrition/MacroBalance'
import { useNutritionStore } from '@/lib/stores/nutrition.store'
import { getDailyNutrition, logNutritionEntry, deleteNutritionEntry } from '@/app/actions/nutrition.actions'
import { getActiveDietTemplate } from '@/app/actions/diet.actions'
import { getNutritionProgression } from '@/app/actions/progression.actions'
import { LogMealDrawer } from '@/components/nutrition/LogMealDrawer'
import { useSync } from '@/hooks/useSync'
import { db } from '@/lib/db/local-db'
import { motion } from 'framer-motion'
import { Trash2, AlertCircle, Zap } from 'lucide-react'

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
  const [progression, setProgression] = useState<any>(null)
  const [dietTemplate, setDietTemplate] = useState<any>(null)
  const { isOnline, addPendingAction } = useSync()
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(false)
  
  useEffect(() => { setMounted(true) }, [])
  
  // Use state for local date object to format it easily
  const dateObj = new Date(selectedDate)

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      // 1. Try to load from Local Cache
      const cached = await db.cachedNutrition.get(selectedDate)
      if (cached) {
        setEntries(cached.entries)
      }

      if (isOnline) {
        try {
          const [data, progData, dietTemplate] = await Promise.all([
            getDailyNutrition(selectedDate),
            getNutritionProgression(selectedDate),
            getActiveDietTemplate()
          ])

          let mapped = data.map((d: any) => ({
            id: d.id,
            mealType: d.mealType as any,
            foodName: d.foodName,
            calories: d.calories,
            proteinG: d.proteinG,
            carbsG: d.carbsG,
            fatG: d.fatG,
            catalogId: d.catalogId
          }))

          setEntries(mapped)
          setProgression(progData)
          setDietTemplate(dietTemplate)

          // Update Cache
          await db.cachedNutrition.put({
            date: selectedDate,
            entries: mapped,
            updatedAt: Date.now()
          })
        } catch (e) {
          console.error(e)
        } finally {
          setLoading(false)
        }
      } else {
        setLoading(false)
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
        grams: Number(mappedEntry.grams || 0),
        calories: mappedEntry.calories,
        proteinG: mappedEntry.proteinG,
        carbsG: mappedEntry.carbsG,
        fatG: mappedEntry.fatG,
        catalogId: mappedEntry.catalogId
      }
      await addPendingAction('SYNC_NUTRITION', payload)
    }
  }

  const handleDeleteEntry = async (id: string) => {
    // Optimistic UI
    const updated = entries.filter(e => e.id !== id)
    setEntries(updated)
    await db.cachedNutrition.put({
      date: selectedDate,
      entries: updated,
      updatedAt: Date.now()
    })

    if (isOnline) {
      await deleteNutritionEntry(id)
    } else {
      await addPendingAction('DELETE_NUTRITION', { id })
    }
  }

  if (!mounted) return null

  const dateLabel = new Intl.DateTimeFormat('es', { weekday: 'long', day: 'numeric', month: 'short' }).format(dateObj)

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gym-primary">Nutrición</h1>
        <div className="flex items-center gap-2 rounded-xl bg-gym-dark-2 border border-gym-border px-3 py-1.5 shadow-sm">
          <button onClick={handlePrevDay} className="p-1 text-gym-secondary hover:text-gym-primary transition-colors">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="w-28 text-center text-[13px] font-bold capitalize text-gym-primary">{dateLabel}</span>
          <button onClick={handleNextDay} className="p-1 text-zinc-400 hover:text-zinc-100">
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Progression Delta */}
      {progression && (
        <div className="grid grid-cols-4 gap-2">
          {Object.entries(progression.deltas).map(([key, delta]: [string, any]) => (
            <div key={key} className="bg-gym-dark-2 border border-gym-border rounded-xl p-2.5 text-center">
              <p className="text-[9px] uppercase tracking-wider text-gym-secondary font-bold">{key === 'calories' ? 'Kcal' : key}</p>
              <div className={`text-[12px] font-bold mt-0.5 flex items-center justify-center gap-0.5 ${delta.absolute > 0 ? 'text-red-400' : delta.absolute < 0 ? 'text-gym-green-accent' : 'text-gym-muted'}`}>
                {delta.absolute > 0 ? '+' : ''}{delta.absolute}
                <span className="text-[10px] opacity-70">({delta.percent}%)</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <MacroBalance goals={targets} />

      <div className="space-y-4">
        {MEALS.map(meal => {
          const mealEntries = entries.filter(e => e.mealType === meal)
          return (
            <div key={meal} className="rounded-2xl border border-gym-border bg-gym-dark-1/50 overflow-hidden shadow-sm">
              <div className="flex justify-between items-center p-4 bg-gym-dark-2/30">
                <h3 className="text-[14px] font-bold text-gym-primary flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-gym-green-accent" />
                  {MEAL_LABELS[meal]}
                </h3>
                <button 
                  onClick={() => handleAddClick(meal)}
                  className="px-3 py-1.5 bg-gym-green-bg/10 text-gym-green-accent text-[11px] font-bold rounded-lg flex items-center gap-1.5 hover:bg-gym-green-bg/20 transition-colors"
                >  <Plus className="h-3.5 w-3.5" /> Agregar
                </button>
              </div>
              
              <div className="p-4 pt-0">
                {/* Diet Template Section If Empty for this meal */}
                {dietTemplate && !mealEntries.some(e => e.catalogId) && (
                   <div className="mb-4">
                     {dietTemplate.items.filter((i: any) => i.mealType === meal).map((item: any, idx: number) => (
                       <button 
                         key={idx}
                         onClick={async () => {
                           const savedId = crypto.randomUUID()
                           const payload = {
                             id: savedId, // Use temp ID for UI
                             mealType: item.mealType,
                             foodName: item.catalog.name,
                             grams: item.grams,
                             calories: Math.round(item.catalog.caloriesPer100g * (item.grams / 100)),
                             proteinG: Number((item.catalog.proteinPer100g * (item.grams / 100)).toFixed(1)),
                             carbsG: Number((item.catalog.carbsPer100g * (item.grams / 100)).toFixed(1)),
                             fatG: Number((item.catalog.fatPer100g * (item.grams / 100)).toFixed(1)),
                             catalogId: item.catalogId
                           }

                           if (isOnline) {
                             try {
                               const saved = await logNutritionEntry({
                                 date: new Date(selectedDate).toISOString(),
                                 ...payload,
                                 id: undefined // Remove temp ID
                               } as any)
                               handleSaveSuccess({ ...payload, id: saved.id })
                             } catch (e) {
                               console.error("Failed to log fixed diet online", e)
                               handleSaveSuccess(payload) // Fallback to offline logic inside handleSaveSuccess
                             }
                           } else {
                             handleSaveSuccess(payload)
                           }
                         }}
                         className="w-full flex items-center justify-between p-3 mb-2 bg-gym-green-bg/5 border border-dashed border-gym-green-accent/30 rounded-xl group hover:bg-gym-green-bg/10 transition-colors"
                       >
                         <div className="text-left">
                           <p className="text-[12px] font-bold text-gym-green-accent flex items-center gap-1">
                             <Check className="w-3 h-3" /> {item.catalog.name} (Plan)
                           </p>
                           <p className="text-[10px] text-gym-secondary">Cargar {item.grams}g automáticmente</p>
                         </div>
                         <Zap className="w-4 h-4 text-gym-green-accent animate-pulse" />
                       </button>
                     ))}
                   </div>
                )}

                {mealEntries.length === 0 && (!dietTemplate || !dietTemplate.items.some((i: any) => i.mealType === meal)) ? (
                  <div className="py-6 text-center border border-dashed border-gym-border rounded-xl">
                    <p className="text-[11px] text-gym-secondary">Sin registros</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {mealEntries.map(e => (
                      <div key={e.id} className="group flex justify-between items-center bg-gym-dark-2 border border-gym-border/50 rounded-xl p-3 hover:border-gym-green-accent/30 transition-all shadow-sm">
                        <div>
                          <p className="text-[13px] font-bold text-gym-primary">{e.foodName}</p>
                          <p className="text-[10px] text-gym-secondary">P: {e.proteinG}g · C: {e.carbsG}g · G: {e.fatG}g</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[13px] font-bold text-gym-green-accent tabular-nums">{e.calories} <span className="text-[10px] font-normal opacity-70">kcal</span></span>
                          <button 
                            onClick={() => handleDeleteEntry(e.id)}
                            className="p-2 text-gym-muted hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
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
