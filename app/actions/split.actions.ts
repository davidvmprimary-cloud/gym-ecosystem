'use server'

import prisma from '@/lib/prisma/client'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const ExerciseSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1),
  order: z.number().int()
})

const SplitSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1),
  order: z.number().int(),
  exercises: z.array(ExerciseSchema)
})

export async function upsertSplit(data: z.infer<typeof SplitSchema>) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const parsed = SplitSchema.parse(data)

  if (parsed.id) {
    // Update existing split
    await prisma.$transaction(async (tx) => {
      // 1. Update split metadata
      await tx.split.update({
        where: { id: parsed.id, userId: user.id },
        data: {
          name: parsed.name,
          order: parsed.order
        }
      })

      // 2. Intelligent Reconciliation of Exercises
      const existingExercises = await tx.exercise.findMany({
        where: { splitId: parsed.id },
        select: { id: true }
      })
      const existingIds = existingExercises.map(e => e.id)
      const passedIds = parsed.exercises.filter(e => e.id).map(e => e.id!)
      
      const idsToDelete = existingIds.filter(id => !passedIds.includes(id))

      // Delete removed exercises
      if (idsToDelete.length > 0) {
        await tx.exercise.deleteMany({
          where: { id: { in: idsToDelete } }
        })
      }

      // Upsert exercises
      for (const ex of parsed.exercises) {
        if (ex.id && existingIds.includes(ex.id)) {
          // Update existing
          await tx.exercise.update({
            where: { id: ex.id },
            data: { name: ex.name, order: ex.order }
          })
        } else {
          // Create new
          await tx.exercise.create({
            data: {
              name: ex.name,
              order: ex.order,
              splitId: parsed.id!
            }
          })
        }
      }
    })
  } else {
    // Create new split
    await prisma.split.create({
      data: {
        name: parsed.name,
        order: parsed.order,
        userId: user.id,
        exercises: {
          create: parsed.exercises.map(ex => ({
            name: ex.name,
            order: ex.order
          }))
        }
      }
    })
  }

  revalidatePath('/profile')
  revalidatePath('/workout')
}

export async function deleteSplit(splitId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  await prisma.split.delete({
    where: { id: splitId, userId: user.id }
  })

  revalidatePath('/profile')
  revalidatePath('/workout')
}
