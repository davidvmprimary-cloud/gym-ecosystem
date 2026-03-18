'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma/client'

const NutritionEntrySchema = z.object({
  date: z.string().datetime(),
  mealType: z.enum(['breakfast', 'lunch', 'dinner', 'snack']),
  foodName: z.string().min(1),
  grams: z.number().nonnegative(),
  calories: z.number().nonnegative(),
  proteinG: z.number().min(0),
  carbsG: z.number().min(0),
  fatG: z.number().min(0),
  catalogId: z.string().uuid().optional(),
})

export async function logNutritionEntry(input: z.infer<typeof NutritionEntrySchema>) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const parsed = NutritionEntrySchema.parse(input)
  const entry = await prisma.nutritionLog.create({
    data: {
      userId: user.id,
      date: new Date(parsed.date),
      mealType: parsed.mealType,
      foodName: parsed.foodName,
      grams: parsed.grams,
      calories: parsed.calories,
      proteinG: parsed.proteinG,
      carbsG: parsed.carbsG,
      fatG: parsed.fatG,
      catalogId: parsed.catalogId,
    }
  })

  revalidatePath('/nutrition')
  return entry
}

export async function deleteNutritionEntry(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  await prisma.nutritionLog.delete({
    where: { id, userId: user.id }
  })

  revalidatePath('/nutrition')
}

export async function getDailyNutrition(date: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const start = new Date(date)
  start.setHours(0, 0, 0, 0)
  const end = new Date(date)
  end.setHours(23, 59, 59, 999)

  return prisma.nutritionLog.findMany({
    where: { userId: user.id, date: { gte: start, lte: end } },
    orderBy: { date: 'asc' },
    include: { catalog: true }
  })
}
