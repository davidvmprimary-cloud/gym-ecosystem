'use client'

export function GlobalProgressRing({ progress, completed, total }: { progress: number, completed: number, total: number }) {
  const pct = total > 0 ? (completed / total) * 100 : 0;

  return (
    <section className="h-[120px] px-5 py-6 flex items-center justify-between border-b border-gym-border" data-purpose="progress-hero">
      <div className="flex flex-col">
        <span className="text-[11px] text-gym-secondary font-bold uppercase tracking-wide">Mejora Global</span>
        <span className="text-[48px] font-bold text-gym-green-bright leading-tight">{progress > 0 ? '+' : ''}{progress.toFixed(1)}%</span>
        <span className="text-[11px] text-gym-secondary">{completed} de {total} ejercicios completados</span>
      </div>
      <div className="relative flex items-center justify-center w-[72px] h-[72px]">
        <svg className="circular-progress w-full h-full">
          <circle cx="36" cy="36" fill="transparent" r="32" stroke="#1A1A1A" strokeWidth="6"></circle>
          <circle cx="36" cy="36" fill="transparent" r="32" stroke="#4E8B5F" strokeDasharray="201" strokeDashoffset={201 - (201 * pct) / 100} strokeLinecap="round" strokeWidth="6"></circle>
        </svg>
        <span className="absolute text-[14px] font-semibold">{Math.round(pct)}%</span>
      </div>
    </section>
  )
}
