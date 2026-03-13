'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

interface SliderDrawerProps {
  isOpen: boolean
  onClose: () => void
  title: string
  subtitle?: string
  min: number
  max: number
  step: number
  currentValue: number
  onSave: (val: number) => Promise<void>
  unit?: string
}

export function SliderDrawer({ isOpen, onClose, title, subtitle, min, max, step, currentValue, onSave, unit = '' }: SliderDrawerProps) {
  const [val, setVal] = useState(currentValue)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    setVal(currentValue)
  }, [isOpen, currentValue])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await onSave(val)
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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 z-[70] rounded-t-3xl bg-gym-dark-1 border-t border-gym-border p-6 pb-safe flex flex-col gap-6"
          >
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-[16px] font-bold text-gym-primary">{title}</h3>
                {subtitle && <p className="text-[12px] text-gym-secondary">{subtitle}</p>}
              </div>
              <button onClick={onClose} className="p-2 bg-gym-dark-3 rounded-full text-gym-secondary hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <input 
                  type="range" 
                  min={min} max={max} step={step} 
                  value={val} 
                  onChange={e => setVal(parseFloat(e.target.value))}
                  className="flex-1 accent-gym-green-accent"
                />
                <span className="w-16 text-right font-bold tabular-nums text-gym-green-accent text-[18px]">
                  {val}{unit}
                </span>
              </div>
            </div>

            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="w-full h-14 bg-gym-green-bg rounded-gym flex items-center justify-center text-[15px] font-semibold text-white disabled:opacity-50 mt-4"
            >
              {isSaving ? 'Guardando...' : 'Aplicar'}
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
