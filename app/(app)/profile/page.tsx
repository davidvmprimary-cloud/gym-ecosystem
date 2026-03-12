import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { LogOut, Trash2, Camera } from 'lucide-react'

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
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Perfil & Ajustes</h1>
        <p className="text-sm text-zinc-400">Gestiona tu cuenta y preferencias</p>
      </div>

      {/* Usuario */}
      <section className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
        <h2 className="text-lg font-semibold text-zinc-200">Datos Personales</h2>
        
        <div className="flex items-center gap-6">
          <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-zinc-800 text-2xl font-bold text-zinc-300">
            {user?.email?.charAt(0).toUpperCase() || 'U'}
            <button className="absolute bottom-0 right-0 rounded-full border border-zinc-800 bg-zinc-700 p-1.5 text-zinc-300 hover:bg-zinc-600">
              <Camera className="h-4 w-4" />
            </button>
          </div>
          <div>
            <h3 className="font-medium">{user?.email}</h3>
            <p className="text-sm text-zinc-400">Miembro activo</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4">
          <div>
            <label className="mb-1 block text-sm text-zinc-400">Peso (kg)</label>
            <input type="number" placeholder="Ej: 75" className="w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-zinc-100 focus:border-green-500 focus:outline-none" />
          </div>
          <div>
            <label className="mb-1 block text-sm text-zinc-400">Altura (cm)</label>
            <input type="number" placeholder="Ej: 180" className="w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-zinc-100 focus:border-green-500 focus:outline-none" />
          </div>
        </div>
      </section>

      {/* Entrenamiento */}
      <section className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
        <h2 className="text-lg font-semibold text-zinc-200">Entrenamiento</h2>
        
        <div>
          <label className="mb-1 block text-sm text-zinc-400">Objetivo de Mejora Global (%)</label>
          <div className="flex items-center gap-3">
            <input type="range" min="0.5" max="10" step="0.5" defaultValue="2.5" className="flex-1 accent-green-500" />
            <span className="w-12 text-right text-sm font-medium">2.5%</span>
          </div>
          <p className="mt-1 text-xs text-zinc-500">Volumen extra requerido por sesión</p>
        </div>

        <div className="pt-2">
          <label className="mb-1 block text-sm text-zinc-400">Días máximos de descanso</label>
          <input type="number" defaultValue="5" className="w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-zinc-100 focus:border-green-500 focus:outline-none" />
          <p className="mt-1 text-xs text-zinc-500">Antes de preguntar si reiniciar el ciclo de splits</p>
        </div>
      </section>

      {/* Nutrición */}
      <section className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
        <h2 className="text-lg font-semibold text-zinc-200">Nutrición</h2>
        
        <div>
          <label className="mb-1 block text-sm text-zinc-400">Meta Calórica Diaria (kcal)</label>
          <input type="number" defaultValue="2500" className="w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-zinc-100 focus:border-green-500 focus:outline-none" />
        </div>

        <div className="grid grid-cols-3 gap-2 pt-2">
          <div>
            <label className="mb-1 block text-xs text-zinc-400">Proteína (g)</label>
            <input type="number" defaultValue="160" className="w-full rounded-md border border-zinc-800 bg-zinc-950 px-2 py-2 text-sm text-zinc-100 focus:border-green-500 focus:outline-none" />
          </div>
          <div>
            <label className="mb-1 block text-xs text-zinc-400">Carbos (g)</label>
            <input type="number" defaultValue="280" className="w-full rounded-md border border-zinc-800 bg-zinc-950 px-2 py-2 text-sm text-zinc-100 focus:border-green-500 focus:outline-none" />
          </div>
          <div>
            <label className="mb-1 block text-xs text-zinc-400">Grasas (g)</label>
            <input type="number" defaultValue="80" className="w-full rounded-md border border-zinc-800 bg-zinc-950 px-2 py-2 text-sm text-zinc-100 focus:border-green-500 focus:outline-none" />
          </div>
        </div>
      </section>

      {/* Acciones */}
      <section className="space-y-3">
        <form action={signOut}>
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 py-3 font-medium text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white"
          >
            <LogOut className="h-5 w-5" />
            Cerrar Sesión
          </button>
        </form>

        <button
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-900/50 bg-red-950/20 px-4 py-3 font-medium text-red-500 transition-colors hover:bg-red-950/40"
        >
          <Trash2 className="h-5 w-5" />
          Eliminar Cuenta
        </button>
      </section>

    </div>
  )
}
