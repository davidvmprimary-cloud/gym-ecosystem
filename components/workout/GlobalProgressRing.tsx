'use client'

import clsx from 'clsx'

export function GlobalProgressRing({ progress }: { progress: number }) {
  const isPositive = progress >= 0
  const isTargetMet = progress >= 2.5 // Mock global target

  const colorClass = isTargetMet
    ? 'text-green-500 border-green-500'
    : isPositive
    ? 'text-yellow-500 border-yellow-500'
    : 'text-red-500 border-red-500'

  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 w-full">
      <div
        className={clsx(
          'relative flex h-32 w-32 items-center justify-center rounded-full border-8 transition-colors',
          colorClass
        )}
      >
        <span className="text-2xl font-bold text-zinc-100">
          {progress > 0 ? '+' : ''}
          {progress.toFixed(1)}%
        </span>
      </div>
      <p className="mt-4 text-xs font-medium text-zinc-400 tracking-wider">PROGRESO DE VOLUMEN</p>
    </div>
  )
}
