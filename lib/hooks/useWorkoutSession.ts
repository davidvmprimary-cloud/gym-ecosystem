import { create } from 'zustand'
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware'
import { get, set, del } from 'idb-keyval'

// Custom IndexedDB storage for Zustand persistence
const idbStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    return (await get(name)) || null
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await set(name, value)
  },
  removeItem: async (name: string): Promise<void> => {
    await del(name)
  },
}

export interface WorkoutSet {
  id: string
  exerciseId: string
  reps: number
  weightKg: number
}

interface WorkoutSessionState {
  isActive: boolean
  splitId: string | null
  sets: WorkoutSet[]
  startSession: (splitId: string) => void
  addSet: (set: WorkoutSet) => void
  removeSet: (setId: string) => void
  finishSession: () => void
  // Derived helpers could be computed in components or via get()
}

export const useWorkoutSession = create<WorkoutSessionState>()(
  persist(
    (set, get) => ({
      isActive: false,
      splitId: null,
      sets: [],

      startSession: (splitId) => {
        set({ isActive: true, splitId, sets: [] })
      },

      addSet: (newSet) => {
        set((state) => ({
          sets: [...state.sets, newSet],
        }))
      },

      removeSet: (setId) => {
        set((state) => ({
          sets: state.sets.filter((s) => s.id !== setId),
        }))
      },

      finishSession: () => {
        // En una app real, aquí enviaríamos los datos a la API.
        // Si falla por falta de red, lo encolamos para reintento.
        set({ isActive: false, splitId: null, sets: [] })
      },
    }),
    {
      name: 'gymtracker-session-storage',
      storage: createJSONStorage(() => idbStorage),
    }
  )
)
