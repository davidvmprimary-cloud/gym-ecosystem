'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma/client'

const CatalogItemSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1),
  caloriesPer100g: z.number().nonnegative(),
  proteinPer100g: z.number().min(0),
  carbsPer100g: z.number().min(0),
  fatPer100g: z.number().min(0),
  baseGrams: z.number().positive().default(100),
})

export async function upsertCatalogItem(data: z.infer<typeof CatalogItemSchema>) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const parsed = CatalogItemSchema.parse(data)

  if (parsed.id) {
    return await prisma.foodCatalog.update({
      where: { id: parsed.id, userId: user.id },
      data: {
        name: parsed.name,
        caloriesPer100g: parsed.caloriesPer100g,
        proteinPer100g: parsed.proteinPer100g,
        carbsPer100g: parsed.carbsPer100g,
        fatPer100g: parsed.fatPer100g,
        baseGrams: parsed.baseGrams,
      }
    })
  } else {
    return await prisma.foodCatalog.create({
      data: {
        userId: user.id,
        name: parsed.name,
        caloriesPer100g: parsed.caloriesPer100g,
        proteinPer100g: parsed.proteinPer100g,
        carbsPer100g: parsed.carbsPer100g,
        fatPer100g: parsed.fatPer100g,
        baseGrams: parsed.baseGrams,
      }
    })
  }
}

export async function deleteCatalogItem(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  await prisma.foodCatalog.delete({
    where: { id, userId: user.id }
  })
}

export async function getFoodCatalog() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  return await prisma.foodCatalog.findMany({
    where: { userId: user.id },
    orderBy: { name: 'asc' }
  })
}
