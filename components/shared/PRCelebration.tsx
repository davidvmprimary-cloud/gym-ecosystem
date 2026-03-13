'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface PRCelebrationProps {
  isVisible: boolean
  prTypes: string[]  // ['volume', 'weight', 'estimated1rm']
  onComplete: () => void
}

const PR_LABELS: Record<string, string> = {
  volume: '🔥 Volumen récord',
  weight: '⚡ Peso récord',
  estimated1rm: '💪 1RM récord',
}

export function PRCelebration({ isVisible, prTypes, onComplete }: PRCelebrationProps) {
  useEffect(() => {
    if (isVisible) {
      // Vibración háptica en móvil
      if ('vibrate' in navigator) navigator.vibrate([50, 30, 100])
      const timer = setTimeout(onComplete, 3000)
      return () => clearTimeout(timer)
    }
  }, [isVisible, onComplete])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          className="fixed bottom-24 left-4 right-4 z-50 pointer-events-none"
        >
          <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-2xl p-4 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <motion.span
                animate={{ rotate: [0, -10, 10, -10, 0] }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-3xl"
              >
                🏆
              </motion.span>
              <div>
                <p className="font-bold text-yellow-400">¡Nuevo Récord Personal!</p>
                <p className="text-sm text-yellow-500/80">{prTypes.map(t => PR_LABELS[t]).join(' · ')}</p>
              </div>
            </div>
            {/* Partículas decorativas */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full bg-yellow-400"
                initial={{ opacity: 1, x: '50%', y: '50%' }}
                animate={{
                  opacity: 0,
                  x: `${50 + (Math.random() - 0.5) * 200}%`,
                  y: `${50 + (Math.random() - 0.5) * 200}%`,
                }}
                transition={{ duration: 1, delay: i * 0.1 }}
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
