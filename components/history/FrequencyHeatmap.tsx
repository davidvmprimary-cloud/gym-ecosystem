'use client'

import { format, subDays, isSameDay, startOfDay } from 'date-fns'
import { es } from 'date-fns/locale'

interface FrequencyHeatmapProps {
  sessions: { date: Date | string; splitName?: string }[]
}

export function FrequencyHeatmap({ sessions }: FrequencyHeatmapProps) {
  const today = startOfDay(new Date())
  // 4 weeks = 28 days
  const days = Array.from({ length: 28 }, (_, i) => subDays(today, 27 - i))

  const getSplitColor = (splitName?: string) => {
    const name = splitName?.toLowerCase() || ''
    if (name.includes('push')) return 'bg-[#4A7FA5]' // fitness-push
    if (name.includes('pull')) return 'bg-[#3D6B47]' // fitness-pull
    if (name.includes('legs') || name.includes('pierna')) return 'bg-[#8B6B4E]' // fitness-legs
    return 'bg-[#5FA870]' // Default accent
  }

  return (
    <div className="bg-gym-dark-1 rounded-[20px] p-5 shadow-sm">
      <h2 className="text-[10px] font-bold text-gym-secondary uppercase tracking-widest mb-4 px-1">FRECUENCIA (28 DÍAS)</h2>
      <div className="grid grid-cols-7 gap-2 mb-4">
        {days.map((day, idx) => {
          const session = sessions.find(s => isSameDay(new Date(s.date), day))
          return (
            <div key={idx} className="aspect-square relative group">
              <div 
                className={`w-full h-full rounded-[7px] transition-all ${
                  session ? getSplitColor(session.splitName) : 'bg-[#1A1A1A]'
                } ${session ? 'shadow-[0_0_10px_rgba(95,168,112,0.1)]' : ''}`}
              />
              {/* Tooltip on hover */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gym-dark-3 text-[9px] text-white rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 border border-gym-border">
                {format(day, 'dd MMM', { locale: es })} {session?.splitName ? `• ${session.splitName}` : ''}
              </div>
            </div>
          )
        })}
      </div>
      
      {/* Legend */}
      <div className="flex flex-wrap gap-4 px-1">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-[#4A7FA5]"></div>
          <span className="text-[10px] text-gym-secondary">Push</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-[#3D6B47]"></div>
          <span className="text-[10px] text-gym-secondary">Pull</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-[#8B6B4E]"></div>
          <span className="text-[10px] text-gym-secondary">Legs</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-[#1A1A1A]"></div>
          <span className="text-[10px] text-gym-secondary">Descanso</span>
        </div>
      </div>
    </div>
  )
}
