'use client'

import { useEffect, useState } from 'react'
import { db } from '@/lib/db/local-db'
import { useLiveQuery } from 'dexie-react-hooks'
import { logNutritionEntry } from '@/app/actions/nutrition.actions'
import { finishWorkoutSession } from '@/app/actions/workout.actions'
import { logBodyStats } from '@/app/actions/user.actions'
import { upsertSplit } from '@/app/actions/split.actions'

export function useSync() {
  const [isOnline, setIsOnline] = useState(typeof window !== 'undefined' ? navigator.onLine : true)
  const pendingActions = useLiveQuery(() => db.pendingActions.toArray())

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Synchronization logic
  useEffect(() => {
    if (isOnline && pendingActions && pendingActions.length > 0) {
      syncData()
    }
  }, [isOnline, pendingActions])

  async function syncData() {
    if (!pendingActions || pendingActions.length === 0) return

    for (const action of pendingActions) {
      try {
        console.log(`[Sync] Processing ${action.type}`, action.payload)
        
        switch (action.type) {
          case 'SYNC_NUTRITION':
            await logNutritionEntry(action.payload)
            break
          case 'SYNC_WORKOUT':
            await finishWorkoutSession(action.payload)
            break
          case 'SYNC_BODY_STATS':
            await logBodyStats(action.payload)
            break
          case 'SYNC_SPLIT':
            await upsertSplit(action.payload)
            break
          // Add other cases as needed
        }
        
        await db.pendingActions.delete(action.id!)
      } catch (error) {
        console.error(`[Sync] Failed to process ${action.type}`, error)
        // If it's a validation error or something permanent, we might want to delete it anyway
        // or keep retrying if it's a network error (isOnline should handle this)
        break; // Stop processing the queue if one fails
      }
    }
  }

  const addPendingAction = async (type: any, payload: any) => {
    await db.pendingActions.add({
      type,
      payload,
      timestamp: Date.now()
    })
    
    if (isOnline) {
      syncData()
    }
  }

  return { isOnline, pendingCount: pendingActions?.length || 0, addPendingAction }
}
