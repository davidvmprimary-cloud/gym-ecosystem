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
      {/* Identity Card */}
      <section className="flex flex-col items-center mb-8 pt-4">
        <div className="relative mb-4">
          <div className="w-[80px] h-[80px] rounded-full border-2 border-gym-green-bg bg-gym-dark-3 flex items-center justify-center">
            <span className="text-[26px] font-bold text-gym-primary">
              {dbUser.name ? dbUser.name.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="absolute bottom-0 right-0 w-[26px] h-[26px] bg-gym-dark-1 border border-gym-dark-3 rounded-full flex items-center justify-center shadow-lg">
            <Camera className="w-3.5 h-3.5 text-gym-secondary" />
          </div>
        </div>
        <h1 className="text-[22px] font-bold text-gym-primary">{dbUser.name || user.email?.split('@')[0]}</h1>
        <p className="text-[11px] text-gym-secondary mt-1">Miembro desde {memberSince}</p>
      </section>

      {/* Body Stats */}
      <section className="mb-10">
        <div className="bg-gym-dark-1 rounded-[14px] flex h-[68px]">
          <div className="flex-1 flex flex-col items-center justify-center">
            <span className="text-[20px] font-bold tabular-nums text-gym-primary">{dbUser.weight || '--'} kg</span>
            <span className="text-[11px] text-gym-secondary">Peso</span>
          </div>
          <div className="w-[1px] h-[32px] bg-gym-border self-center"></div>
          <div className="flex-1 flex flex-col items-center justify-center">
            <span className="text-[20px] font-bold tabular-nums text-gym-primary">{dbUser.height || '--'} cm</span>
            <span className="text-[11px] text-gym-secondary">Altura</span>
          </div>
          <div className="w-[1px] h-[32px] bg-gym-border self-center"></div>
          <div className="flex-1 flex flex-col items-center justify-center">
            <span className="text-[20px] font-bold tabular-nums text-gym-primary">
              {dbUser.birthDate ? new Date().getFullYear() - new Date(dbUser.birthDate).getFullYear() : '--'} a
            </span>
            <span className="text-[11px] text-gym-secondary">Edad</span>
          </div>
        </div>
      </section>

      <ProfileClient user={dbUser} />
    </div>
  )
}
