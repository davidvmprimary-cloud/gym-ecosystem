import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { LogOut } from 'lucide-react'

export default async function ProfilePage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  async function signOut() {
    'use server'
    const supabaseServer = createClient()
    await supabaseServer.auth.signOut()
    redirect('/login')
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Perfil</h1>

      <div className="rounded-xl border border-zinc-800 p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-800 text-xl font-bold text-zinc-300">
            {user?.email?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <h2 className="text-lg font-medium">{user?.email}</h2>
            <p className="text-sm text-zinc-400">Miembro activo</p>
          </div>
        </div>
      </div>

      <form action={signOut}>
        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 py-3 font-medium text-red-500 transition-colors hover:bg-zinc-800"
        >
          <LogOut className="h-5 w-5" />
          Cerrar Sesión
        </button>
      </form>

    </div>
  )
}
