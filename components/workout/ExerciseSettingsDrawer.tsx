'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

interface ExerciseSettingsDrawerProps {
  isOpen: boolean
  onClose: () => void
  exerciseName: string
  currentImprovementTarget: number
  onSave: (newTarget: number) => Promise<void>
}

export function ExerciseSettingsDrawer({ isOpen, onClose, exerciseName, currentImprovementTarget, onSave }: ExerciseSettingsDrawerProps) {
  const [target, setTarget] = useState(currentImprovementTarget)
  const [isSaving, setIsSaving] = useState(false)

  // Reset state when opened with new props
  useEffect(() => {
    setTarget(currentImprovementTarget)
  }, [isOpen, currentImprovementTarget])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await onSave(target)
      onClose()
    } catch (e) {
      console.error(e)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 z-[70] rounded-t-3xl bg-gym-dark-1 border-t border-gym-border p-6 pb-safe flex flex-col gap-6"
          >
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-gym-primary">{exerciseName}</h3>
                <p className="text-xs text-gym-secondary">Configuración Avanzada</p>
              </div>
              <button onClick={onClose} className="p-2 bg-gym-dark-3 rounded-full text-gym-secondary hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gym-primary mb-2">Objetivo de Mejora (%)</label>
                <div className="flex items-center gap-4">
                  <input 
                    type="range" 
                    min="0" max="10" step="0.5" 
                    value={target} 
                    onChange={e => setTarget(parseFloat(e.target.value))}
                    className="flex-1 accent-gym-green-accent"
                  />
                  <span className="w-12 text-right font-bold tabular-nums text-gym-green-accent">+{target}%</span>
                </div>
                <p className="text-xs text-gym-muted mt-2">
                  Porcentaje objetivo para el cálculo matemático de sobrecarga progresiva (Overload Engine).
                </p>
              </div>
            </div>

            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="w-full h-14 bg-gym-green-bg rounded-gym flex items-center justify-center text-[15px] font-semibold text-white disabled:opacity-50 mt-4"
            >
              {isSaving ? 'Guardando...' : 'Aplicar Configuración'}
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
