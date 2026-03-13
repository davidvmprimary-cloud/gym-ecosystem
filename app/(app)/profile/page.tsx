import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma/client'
import { redirect } from 'next/navigation'
import { ProfileClient } from '@/components/profile/ProfileClient'
import { Camera } from 'lucide-react'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch the full User record from Prisma
  let dbUser: any = null
  try {
    const { ensureUserExists } = await import('@/lib/auth/ensure-user')
    dbUser = await ensureUserExists(user.id, user.email!)
  } catch (error) {
    console.error('Error ensuring user exists:', error)
  }

  if (!dbUser) {
    return (
      <div className="min-h-screen bg-gym-black text-gym-primary p-6 flex flex-col items-center justify-center gap-6">
        <div className="text-center space-y-2">
          <h1 className="text-xl font-bold">Error de Perfil</h1>
          <p className="text-gym-secondary text-sm">No pudimos cargar tu información. Intenta cerrar sesión y volver a entrar.</p>
        </div>
        <ProfileClient user={{ id: user.id, email: user.email }} isLimited />
      </div>
    )
  }

  const memberSince = new Intl.DateTimeFormat('es', { month: 'long', year: 'numeric' }).format(new Date(dbUser.createdAt))

  return (
    <div className="min-h-screen bg-gym-black text-gym-primary p-6 pb-24">
      <ProfileClient 
        user={dbUser} 
        isLimited={false} 
        memberSince={memberSince}
      />
    </div>
  )
}
