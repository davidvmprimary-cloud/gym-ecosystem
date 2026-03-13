import { BottomNav } from '@/components/shared/BottomNav'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-gym-black pb-32 text-gym-primary font-sans selection:bg-gym-green-bg selection:text-white">
      <main className="flex-1">{children}</main>
      <BottomNav />
    </div>
  )
}
