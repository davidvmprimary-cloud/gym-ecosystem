import prisma from '@/lib/prisma/client'
import { unstable_cache } from 'next/cache'

/**
 * Fetch splits for a user with caching
 * Tagged for invalidation when splits are updated
 */
export const getCachedUserSplits = (userId: string) => {
  return unstable_cache(
    async () => {
      return prisma.split.findMany({
        where: { userId },
        orderBy: { order: 'asc' },
        include: { exercises: { orderBy: { order: 'asc' } } }
      })
    },
    [`user-splits-${userId}`],
    {
      revalidate: 60, // 1 minute TTL
      tags: [`user-splits-${userId}`]
    }
  )()
}

/**
 * Fetch exercise catalog (global or user-specific if we had one)
 */
export const getExerciseCatalog = unstable_cache(
  async () => {
    // Current schema doesn't have a separate ExerciseCatalog model, 
    // it seems exercises are directly in splits. 
    // If we had a catalog, we'd fetch it here.
    return [] 
  },
  ['exercise-catalog'],
  { revalidate: 3600 } // 1 hour
)
