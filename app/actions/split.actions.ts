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

      // 2. Clear old exercises and recreate (Simpler for MVP than complex diffing)
      await tx.exercise.deleteMany({
        where: { splitId: parsed.id }
      })

      await tx.exercise.createMany({
        data: parsed.exercises.map(ex => ({
          name: ex.name,
          order: ex.order,
          splitId: parsed.id!
        }))
      })
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
