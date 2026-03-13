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
  draftSets: Record<string, { weightKg: number; reps: number }>
  startSession: (splitId: string) => void
  addSet: (set: WorkoutSet) => void
  removeSet: (setId: string) => void
  updateDraft: (exerciseId: string, weightKg: number, reps: number) => void
  commitDraft: (exerciseId: string) => void
  finishSession: () => void
}

export const useWorkoutSession = create<WorkoutSessionState>()(
  persist(
    (set, get) => ({
      isActive: false,
      splitId: null,
      sets: [],
      draftSets: {},

      startSession: (splitId) => {
        set({ isActive: true, splitId, sets: [], draftSets: {} })
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

      updateDraft: (exerciseId, weightKg, reps) => {
        set((state) => ({
          draftSets: {
            ...state.draftSets,
            [exerciseId]: { weightKg, reps }
          }
        }))
      },

      commitDraft: (exerciseId) => {
        set((state) => {
          const draft = state.draftSets[exerciseId]
          if (!draft) return state

          return {
            sets: [...state.sets, { id: crypto.randomUUID(), exerciseId, weightKg: draft.weightKg, reps: draft.reps }],
            draftSets: { ...state.draftSets, [exerciseId]: { weightKg: 0, reps: 0 } }
          }
        })
      },

      finishSession: () => {
        set({ isActive: false, splitId: null, sets: [], draftSets: {} })
      },
    }),
    {
      name: 'gymtracker-session-storage',
      storage: createJSONStorage(() => idbStorage),
    }
  )
)
