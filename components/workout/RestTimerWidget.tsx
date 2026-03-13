'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useRestTimer } from '@/lib/hooks/useRestTimer'

export function RestTimerWidget() {
  const { display, isRunning, progress, stop } = useRestTimer(90)

  return (
    <AnimatePresence>
      {isRunning && (
        <motion.div
          initial={{ opacity: 0, y: 80 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 80 }}
          className="fixed bottom-20 left-4 right-4 z-40"
        >
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-center gap-4 shadow-2xl">
            {/* Ring de progreso SVG */}
            <div className="relative w-14 h-14 flex-shrink-0">
              <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
                <circle cx="28" cy="28" r="24" fill="none" stroke="#27272a" strokeWidth="4" />
                <circle
                  cx="28" cy="28" r="24" fill="none"
                  stroke="#3b82f6" strokeWidth="4"
                  strokeDasharray={`${2 * Math.PI * 24}`}
                  strokeDashoffset={`${2 * Math.PI * 24 * (1 - progress / 100)}`}
                  strokeLinecap="round"
                  className="transition-all duration-1000"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-sm font-bold tabular-nums text-zinc-100">
                {display}
              </span>
            </div>

            <div className="flex-1">
              <p className="text-sm font-medium text-zinc-100">Descansando</p>
              <p className="text-xs text-zinc-500">Toca saltar para omitir</p>
            </div>

            <button onClick={stop} className="text-xs text-zinc-400 bg-zinc-800 px-3 py-1.5 rounded-full hover:bg-zinc-700 transition">
              Saltar
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
