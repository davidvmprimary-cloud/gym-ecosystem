'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Calendar } from 'lucide-react'

// 0=Domingo, 1=Lunes, ...
const DAYS = [
  { id: 1, name: 'Lunes' },
  { id: 2, name: 'Martes' },
  { id: 3, name: 'Miércoles' },
  { id: 4, name: 'Jueves' },
  { id: 5, name: 'Viernes' },
  { id: 6, name: 'Sábado' },
  { id: 0, name: 'Domingo' }
]

interface WeeklyScheduleDrawerProps {
  isOpen: boolean
  onClose: () => void
  splits: any[]
  currentSchedule: Record<string, string | null>
  onSave: (schedule: Record<string, string | null>) => Promise<void>
}

export function WeeklyScheduleDrawer({ isOpen, onClose, splits, currentSchedule, onSave }: WeeklyScheduleDrawerProps) {
  const [schedule, setSchedule] = useState<Record<string, string | null>>({})
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setSchedule(currentSchedule || {})
    }
  }, [isOpen, currentSchedule])

  const handleSelect = (dayId: number, splitId: string | null) => {
    setSchedule(prev => ({ ...prev, [dayId.toString()]: splitId }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await onSave(schedule)
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
              <div className="flex items-center gap-3">
                <Calendar className="w-6 h-6 text-gym-green-accent" />
                <div>
                  <h3 className="text-lg font-bold text-gym-primary">Distribución Semanal</h3>
                  <p className="text-xs text-gym-secondary">Elige qué rutina toca cada día</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 bg-gym-dark-3 rounded-full text-gym-secondary hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {DAYS.map(day => {
                const selectedSplit = schedule[day.id.toString()]
                return (
                  <div key={day.id} className="flex items-center justify-between border-b border-gym-border pb-3">
                    <span className="text-[14px] font-medium text-gym-primary w-24">{day.name}</span>
                    <select
                      value={selectedSplit || ''}
                      onChange={(e) => handleSelect(day.id, e.target.value === '' ? null : e.target.value)}
                      className="flex-1 bg-gym-dark-3 border border-gym-border rounded-lg px-3 py-2 text-[14px] text-gym-primary focus:outline-none focus:border-gym-green-accent"
                    >
                      <option value="">Descanso</option>
                      {splits.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                )
              })}
            </div>

            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="w-full h-14 bg-gym-green-bg rounded-gym flex items-center justify-center text-[15px] font-semibold text-white disabled:opacity-50 mt-2"
            >
              {isSaving ? 'Guardando...' : 'Guardar Horario'}
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
