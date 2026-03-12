export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 px-4 py-12">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-100">GymTracker</h1>
          <p className="mt-2 text-sm text-zinc-400">Tu progreso, offline y al instante.</p>
        </div>
        {children}
      </div>
    </div>
  )
}
