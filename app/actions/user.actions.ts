'use server'

import prisma from '@/lib/prisma/client'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const IdentitySchema = z.object({
  name: z.string().min(1).optional(),
  avatarUrl: z.string().url().or(z.literal('')).optional(),
})

const BodyStatsSchema = z.object({
  weightKg: z.number().positive().optional(),
  heightCm: z.number().positive().optional(),
})

export async function updateIdentity(data: z.infer<typeof IdentitySchema>) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const parsed = IdentitySchema.parse(data)

  await prisma.user.update({
    where: { id: user.id },
    data: parsed
  })

  revalidatePath('/profile')
}

export async function logBodyStats(data: z.infer<typeof BodyStatsSchema>) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const parsed = BodyStatsSchema.parse(data)

  await prisma.$transaction(async (tx) => {
    // 1. Update User current stats
    await tx.user.update({
      where: { id: user.id },
      data: {
        weight: parsed.weightKg,
        height: parsed.heightCm
      }
    })

    // 2. If weight is provided, log it in history
    if (parsed.weightKg) {
      await tx.bodyWeightLog.create({
        data: {
          userId: user.id,
          weightKg: parsed.weightKg,
          date: new Date()
        }
      })
    }
  })

  revalidatePath('/profile')
  revalidatePath('/history')
}

export async function getBodyWeightHistory() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  return await prisma.bodyWeightLog.findMany({
    where: { userId: user.id },
    orderBy: { date: 'asc' }
  })
}
