import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma/client'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      targetCalories: true,
      targetProtein: true,
      targetCarbs: true,
      targetFat: true,
      maxRestDays: true,
      defaultImprovementTarget: true
    }
  })

  return NextResponse.json(dbUser)
}
