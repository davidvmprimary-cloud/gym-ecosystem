import { BottomNav } from '@/components/shared/BottomNav'
import { SyncStatus } from '@/components/shared/SyncStatus'
import { createClient } from '@/lib/supabase/server'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    try {
      const { ensureUserExists } = await import('@/lib/auth/ensure-user')
      await ensureUserExists(user.id, user.email!)
    } catch (e) {
      console.error('Error auto-healing user in AppLayout:', e)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-gym-black pb-32 text-gym-primary font-sans selection:bg-gym-green-bg selection:text-white">
      <SyncStatus />
      <main className="flex-1">{children}</main>
      <BottomNav />
    </div>
  )
}
