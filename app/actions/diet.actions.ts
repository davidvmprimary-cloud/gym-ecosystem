'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma/client'

const DietTemplateSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1),
  items: z.array(z.object({
    catalogId: z.string().uuid(),
    mealType: z.string(),
    grams: z.number().positive(),
  }))
})

export async function upsertDietTemplate(data: z.infer<typeof DietTemplateSchema>) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const parsed = DietTemplateSchema.parse(data)

  if (parsed.id) {
    // Update logic (complex due to nested items)
    await prisma.$transaction(async (tx) => {
      await tx.dietTemplate.update({
        where: { id: parsed.id, userId: user.id },
        data: { name: parsed.name }
      })
      await tx.dietTemplateItem.deleteMany({ where: { templateId: parsed.id } })
      await tx.dietTemplateItem.createMany({
        data: parsed.items.map(item => ({
          templateId: parsed.id!,
          catalogId: item.catalogId,
          mealType: item.mealType,
          grams: item.grams
        }))
      })
    })
  } else {
    await prisma.dietTemplate.create({
      data: {
        userId: user.id,
        name: parsed.name,
        items: {
          create: parsed.items.map(item => ({
            catalogId: item.catalogId,
            mealType: item.mealType,
            grams: item.grams
          }))
        }
      }
    })
  }
}

export async function toggleFixedDiet(isActive: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  await prisma.user.update({
    where: { id: user.id },
    data: { isFixedDietActive: isActive }
  })
  
  revalidatePath('/profile')
  revalidatePath('/nutrition')
}

export async function getActiveDietTemplate() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  return await prisma.dietTemplate.findFirst({
    where: { userId: user.id, isActive: true },
    include: { items: { include: { food: true } } }
  })
}
