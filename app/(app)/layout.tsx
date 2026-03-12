import { BottomNav } from '@/components/shared/BottomNav'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 pb-20 text-zinc-50">
      <main className="flex-1 px-4 py-6">{children}</main>
      <BottomNav />
    </div>
  )
}
