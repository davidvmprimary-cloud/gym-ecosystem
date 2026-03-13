import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface NutritionEntry {
  id: string
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  foodName: string
  calories: number
  proteinG: number
  carbsG: number
  fatG: number
}

interface NutritionStore {
  selectedDate: string
  entries: NutritionEntry[]
  isLoading: boolean

  setDate: (date: string) => void
  addEntry: (entry: NutritionEntry) => void
  removeEntry: (id: string) => void
  setEntries: (entries: NutritionEntry[]) => void

  getDailyTotals: () => { calories: number; proteinG: number; carbsG: number; fatG: number }
}

export const useNutritionStore = create<NutritionStore>()(
  persist(
    (set, get) => ({
      selectedDate: new Date().toISOString().split('T')[0],
      entries: [],
      isLoading: false,

      setDate: (date) => set({ selectedDate: date }),
      addEntry: (entry) => set(s => ({ entries: [...s.entries, entry] })),
      removeEntry: (id) => set(s => ({ entries: s.entries.filter(e => e.id !== id) })),
      setEntries: (entries) => set({ entries }),

      getDailyTotals: () => {
        const { entries } = get()
        return entries.reduce(
          (acc, e) => ({
            calories: acc.calories + e.calories,
            proteinG: acc.proteinG + e.proteinG,
            carbsG: acc.carbsG + e.carbsG,
            fatG: acc.fatG + e.fatG,
          }),
          { calories: 0, proteinG: 0, carbsG: 0, fatG: 0 }
        )
      }
    }),
    { name: 'nutrition-cache' }
  )
)
