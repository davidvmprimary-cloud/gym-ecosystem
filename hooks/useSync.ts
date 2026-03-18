'use client'

import { useEffect, useState } from 'react'
import { db } from '@/lib/db/local-db'
import { useLiveQuery } from 'dexie-react-hooks'
import { logNutritionEntry, deleteNutritionEntry } from '@/app/actions/nutrition.actions'
import { finishWorkoutSession } from '@/app/actions/workout.actions'
import { logBodyStats } from '@/app/actions/user.actions'
import { upsertSplit } from '@/app/actions/split.actions'
import { upsertCatalogItem } from '@/app/actions/catalog.actions'
import { upsertDietTemplate } from '@/app/actions/diet.actions'

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
    // Fetch fresh actions to avoid closure issues
    const currentActions = await db.pendingActions.toArray()
    if (!currentActions || currentActions.length === 0) return

    for (const action of currentActions) {
      try {
        console.log(`[Sync] Processing ${action.type}`, action.payload)
        
        switch (action.type) {
          case 'SYNC_NUTRITION':
            await logNutritionEntry(action.payload)
            break
          case 'DELETE_NUTRITION':
            await deleteNutritionEntry(action.payload.id)
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
          case 'SYNC_CATALOG':
            await upsertCatalogItem(action.payload)
            break
          case 'SYNC_DIET':
            await upsertDietTemplate(action.payload)
            break
        }
        
        await db.pendingActions.delete(action.id!)
      } catch (error) {
        console.error(`[Sync] Failed to process ${action.type}`, error)
        // If it's a validation error or similar, we might want to remove it to avoid blocking the queue forever
        // For now, let's just delete it if it fails, tagging it in console. 
        // In a more complex app, we'd move it to a 'failedActions' table.
        await db.pendingActions.delete(action.id!)
      }
    }
  }

  const addPendingAction = async (type: any, payload: any) => {
    await db.pendingActions.add({
      type,
      payload,
      timestamp: Date.now()
    })
    // useEffect will pick this up when isOnline is true
  }

  return { isOnline, pendingCount: pendingActions?.length || 0, addPendingAction }
}
