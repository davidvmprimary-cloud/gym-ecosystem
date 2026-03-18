'use server'

import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma/client'

export async function getNutritionProgression(date: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const targetDate = new Date(date)
  const prevDate = new Date(date)
  prevDate.setDate(prevDate.getDate() - 1)

  const [currentLogs, prevLogs] = await Promise.all([
    prisma.nutritionLog.findMany({
      where: { userId: user.id, date: { gte: new Date(targetDate.setHours(0,0,0,0)), lte: new Date(targetDate.setHours(23,59,59,999)) } }
    }),
    prisma.nutritionLog.findMany({
      where: { userId: user.id, date: { gte: new Date(prevDate.setHours(0,0,0,0)), lte: new Date(prevDate.setHours(23,59,59,999)) } }
    })
  ])

  const sum = (logs: any[]) => ({
    calories: logs.reduce((acc, l) => acc + l.calories, 0),
    protein: logs.reduce((acc, l) => acc + l.proteinG, 0),
    carbs: logs.reduce((acc, l) => acc + l.carbsG, 0),
    fat: logs.reduce((acc, l) => acc + l.fatG, 0),
  })

  const currentTotals = sum(currentLogs)
  const prevTotals = sum(prevLogs)

  const calcDelta = (curr: number, prev: number) => {
    if (prev === 0) return { absolute: curr, percent: curr > 0 ? 100 : 0 }
    const absolute = curr - prev
    const percent = Math.round((absolute / prev) * 100)
    return { absolute, percent }
  }

  return {
    current: currentTotals,
    prev: prevTotals,
    deltas: {
      calories: calcDelta(currentTotals.calories, prevTotals.calories),
      protein: calcDelta(currentTotals.protein, prevTotals.protein),
      carbs: calcDelta(currentTotals.carbs, prevTotals.carbs),
      fat: calcDelta(currentTotals.fat, prevTotals.fat),
    }
  }
}
