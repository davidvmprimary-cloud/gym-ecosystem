'use client'

import { useState, useMemo } from 'react'
import { VolumeChart } from './VolumeChart'
import { FrequencyHeatmap } from './FrequencyHeatmap'
import { WeightChart } from './WeightChart'
import { CalendarDays, TrendingUp, Trophy, ChevronRight, Flame } from 'lucide-react'
import { format, subDays, isAfter } from 'date-fns'
import { es } from 'date-fns/locale'

interface HistoryClientProps {
  initialSessions: any[]
  weights: any[]
  streak: number
  totalVolume: number
  volumeTrend: number
}

type TimeRange = '1S' | '1M' | '3M' | '6M' | '1A'

export function HistoryClient({ 
  initialSessions, 
  weights, 
  streak, 
  totalVolume: initialTotalVolume, 
  volumeTrend: initialVolumeTrend 
}: HistoryClientProps) {
  const [range, setRange] = useState<TimeRange>('1M')

  const filteredSessions = useMemo(() => {
    const now = new Date()
    let days = 30
    if (range === '1S') days = 7
    if (range === '3M') days = 90
    if (range === '6M') days = 180
    if (range === '1A') days = 365

    const cutoff = subDays(now, days)
    return initialSessions.filter(s => isAfter(new Date(s.date), cutoff))
  }, [range, initialSessions])

  const filteredWeights = useMemo(() => {
    const now = new Date()
    let days = 30
    if (range === '1S') days = 7
    if (range === '3M') days = 90
    if (range === '6M') days = 180
    if (range === '1A') days = 365

    const cutoff = subDays(now, days)
    return weights.filter(w => isAfter(new Date(w.date), cutoff))
  }, [range, weights])

  const currentVolume = useMemo(() => {
    return filteredSessions.reduce((sum, s) => sum + (s.totalVolume || 0), 0)
  }, [filteredSessions])

  const volumeData = useMemo(() => {
    return filteredSessions.map(s => ({
      date: s.date,
      volume: s.totalVolume || 0,
      splitName: s.split?.name
    }))
  }, [filteredSessions])

  const recentSessions = useMemo(() => {
    return [...initialSessions].reverse().slice(0, 10)
  }, [initialSessions])

  return (
    <div className="min-h-screen bg-[#0C0C0C] text-[#F0F0F0] font-sans pb-24">
      {/* Header */}
      <header className="p-5 pb-2 sticky top-0 bg-[#0C0C0C]/90 backdrop-blur-md z-50">
        <h1 className="text-[22px] font-bold text-[#F0F0F0]">Progreso</h1>
      </header>

      {/* Time Range Selector */}
      <nav className="px-5 mb-6 sticky top-[60px] bg-[#0C0C0C]/90 backdrop-blur-md z-40 py-2">
        <div className="bg-[#141414] p-1 rounded-full flex justify-between items-center text-[11px] font-medium text-[#8A8A8A]">
          {(['1S', '1M', '3M', '6M', '1A'] as TimeRange[]).map((r) => (
            <button 
              key={r}
              onClick={() => setRange(r)}
              className={`flex-1 py-1.5 rounded-full text-center transition-all ${
                range === r ? 'bg-[#3D6B47] text-white shadow-sm' : 'hover:text-[#F0F0F0]'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </nav>

      <main className="px-5 space-y-6">
        {/* Global Volume Chart */}
        <section className="bg-[#141414] rounded-2xl p-5 shadow-sm border border-[#262626]">
          <header className="flex justify-between items-start mb-1">
            <div>
              <h2 className="text-[10px] font-bold text-[#8A8A8A] uppercase tracking-widest">VOLUMEN GLOBAL</h2>
              <div className="text-[32px] font-bold tabular-nums text-[#F0F0F0] leading-tight mt-1">
                {currentVolume.toLocaleString()}<span className="text-sm font-normal ml-1">kg</span>
              </div>
            </div>
            <div className={`flex items-center text-xs font-semibold mt-2 ${initialVolumeTrend >= 0 ? 'text-[#5FA870]' : 'text-red-400'}`}>
              <TrendingUp className={`w-3 h-3 mr-1 ${initialVolumeTrend < 0 ? 'rotate-180' : ''}`} />
              {initialVolumeTrend >= 0 ? '+' : ''}{initialVolumeTrend.toFixed(1)}%
            </div>
          </header>
          
          <VolumeChart data={volumeData} />
        </section>

        {/* Frequency Heatmap */}
        <FrequencyHeatmap sessions={initialSessions.map(s => ({ date: s.date, splitName: s.split?.name }))} />

        {/* Streak Info */}
        <div className="flex items-center gap-2 px-1 text-sm font-medium text-[#F0F0F0]">
          <div className="w-8 h-8 rounded-full bg-[#5FA870]/10 flex items-center justify-center">
            <Flame className="w-4 h-4 text-[#5FA870]" />
          </div>
          <span>Racha actual: <span className="text-[#5FA870] font-bold">{streak} días</span></span>
        </div>

        {/* Weight History Card */}
        <section className="bg-[#141414] rounded-2xl p-5 shadow-sm border border-[#262626]">
          <header className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-[10px] font-bold text-[#8A8A8A] uppercase tracking-widest">PESO CORPORAL</h2>
              <div className="text-2xl font-bold tabular-nums text-[#F0F0F0] mt-1">
                {weights.length > 0 ? weights[weights.length-1].weightKg.toFixed(1) : '--'}
                <span className="text-xs font-normal ml-1">kg</span>
              </div>
            </div>
            <CalendarDays className="w-5 h-5 text-[#8A8A8A]" />
          </header>
          <WeightChart data={filteredWeights} />
        </section>

        {/* History List */}
        <section className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <h2 className="text-[10px] font-bold text-[#8A8A8A] uppercase tracking-widest">HISTORIAL RECIENTE</h2>
            <button className="text-[10px] text-[#5FA870] font-bold uppercase tracking-widest">VER TODO</button>
          </div>

          <div className="space-y-3">
            {recentSessions.length > 0 ? (
              recentSessions.map((session) => {
                const splitType = session.split?.name.toLowerCase() || ''
                let bgColor = 'bg-[#1A1A1A]'
                let textColor = 'text-[#5FA870]'
                
                if (splitType.includes('push')) { bgColor = 'bg-[#4A7FA5]/10'; textColor = 'text-[#4A7FA5]' }
                else if (splitType.includes('pull')) { bgColor = 'bg-[#3D6B47]/10'; textColor = 'text-[#3D6B47]' }
                else if (splitType.includes('legs') || splitType.includes('pierna')) { bgColor = 'bg-[#8B6B4E]/10'; textColor = 'text-[#8B6B4E]' }

                return (
                  <div key={session.id} className="bg-[#141414] h-18 rounded-xl flex items-center px-4 py-3 justify-between active:scale-[0.98] transition-all cursor-pointer border border-[#262626]">
                    <div className="flex items-center gap-3">
                      <div className={`${bgColor} px-2 py-1 rounded-md min-w-[54px] text-center`}>
                        <span className={`text-[9px] font-bold ${textColor} tracking-tighter uppercase`}>
                          [{session.split?.name || 'TRAIN'}]
                        </span>
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-[#F0F0F0]">
                          {format(new Date(session.date), 'eee d MMM', { locale: es })}
                        </div>
                        <div className="text-[10px] text-[#8A8A8A] tabular-nums mt-0.5">
                          {Math.round(session.totalVolume || 0).toLocaleString()} kg
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        {session.progressPct !== null && (
                          <div className={`text-[10px] font-bold tabular-nums ${session.progressPct >= 0 ? 'text-[#5FA870]' : 'text-red-400'}`}>
                            {session.progressPct >= 0 ? '+' : ''}{session.progressPct.toFixed(1)}% {session.progressPct >= 0 ? '↑' : '↓'}
                          </div>
                        )}
                        {session.sets?.some((s: any) => s.isPersonalRecord) && (
                          <Trophy className="w-3.5 h-3.5 text-[#C8922A] ml-auto mt-0.5" />
                        )}
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#8A8A8A]" />
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="py-12 text-center bg-[#141414] rounded-2xl border border-dashed border-[#262626]">
                <p className="text-[13px] text-[#8A8A8A]">Aún no has registrado sesiones.</p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}
