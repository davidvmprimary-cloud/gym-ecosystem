'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Check, Scale, Ruler, CalendarDays } from 'lucide-react'
import { logBodyStats } from '@/app/actions/user.actions'
import { useSync } from '@/hooks/useSync'

interface BodyStatsDrawerProps {
  isOpen: boolean
  onClose: () => void
  currentWeight: number
  currentHeight: number
  currentBirthDate: string | null
}

export function BodyStatsDrawer({ isOpen, onClose, currentWeight, currentHeight, currentBirthDate }: BodyStatsDrawerProps) {
  const [weight, setWeight] = useState<number | ''>(currentWeight || '')
  const [height, setHeight] = useState<number | ''>(currentHeight || '')
  const [birthDate, setBirthDate] = useState<string>(currentBirthDate ? new Date(currentBirthDate).toISOString().split('T')[0] : '')
  const [isSaving, setIsSaving] = useState(false)
  const { isOnline, addPendingAction } = useSync()

  useEffect(() => {
    setWeight(currentWeight || '')
    setHeight(currentHeight || '')
    setBirthDate(currentBirthDate ? new Date(currentBirthDate).toISOString().split('T')[0] : '')
  }, [isOpen, currentWeight, currentHeight, currentBirthDate])

  const handleSave = async () => {
    setIsSaving(true)
    const payload = { 
      weightKg: weight === '' ? undefined : Number(weight), 
      heightCm: height === '' ? undefined : Number(height),
      birthDate: birthDate || undefined
    }

    try {
      if (!isOnline) {
        await addPendingAction('SYNC_BODY_STATS', payload)
        onClose()
        return
      }
      await logBodyStats(payload)
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
            className="fixed bottom-0 left-0 right-0 z-[70] rounded-t-3xl bg-gym-dark-1 border-t border-gym-border p-6 pb-8 flex flex-col"
          >
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-[16px] font-bold text-gym-primary">Medidas Corporales</h3>
                <p className="text-[12px] text-gym-secondary">Registra tu progreso físico</p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={handleSave}
                  disabled={isSaving}
                  className="p-2 bg-gym-green-bg rounded-full text-white disabled:opacity-50"
                >
                  <Check className="w-5 h-5" />
                </button>
                <button onClick={onClose} className="p-2 bg-gym-dark-3 rounded-full text-gym-secondary hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="space-y-8 py-4">
              {/* Weight Input */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 px-1">
                  <Scale className="w-4 h-4 text-gym-green-accent" />
                  <label className="text-[11px] font-medium uppercase tracking-wide text-gym-secondary">Peso Actual (Kg)</label>
                </div>
                <div className="relative">
                  <input 
                    type="number" 
                    step="0.1"
                    value={weight || ''}
                    onChange={(e) => setWeight(Number(e.target.value))}
                    placeholder="75.0"
                    className="w-full h-16 bg-gym-dark-2 border border-gym-border rounded-gym px-6 text-[22px] font-bold text-gym-primary focus:border-gym-green-accent outline-none text-center shadow-inner tabular-nums"
                  />
                  <div className="absolute inset-y-0 right-6 flex items-center pointer-events-none">
                    <span className="text-[14px] font-medium text-gym-muted">kg</span>
                  </div>
                </div>
                <p className="text-[10px] text-gym-muted px-2 italic text-center">Registrar el peso creará una entrada en tu historial de progreso.</p>
              </div>

              {/* Height Input */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 px-1">
                  <Ruler className="w-4 h-4 text-gym-secondary" />
                  <label className="text-[11px] font-medium uppercase tracking-wide text-gym-secondary">Altura (Cm)</label>
                </div>
                <div className="relative">
                  <input 
                    type="number" 
                    value={height || ''}
                    onChange={(e) => setHeight(Number(e.target.value))}
                    placeholder="175"
                    className="w-full h-16 bg-gym-dark-2 border border-gym-border rounded-gym px-6 text-[22px] font-bold text-gym-primary focus:border-gym-green-accent outline-none text-center shadow-inner tabular-nums"
                  />
                  <div className="absolute inset-y-0 right-6 flex items-center pointer-events-none">
                    <span className="text-[14px] font-medium text-gym-muted">cm</span>
                  </div>
                </div>
              </div>

              {/* Birth Date Input */}
              <div className="space-y-3 pb-8">
                <div className="flex items-center gap-2 px-1">
                  <CalendarDays className="w-4 h-4 text-gym-secondary" />
                  <label className="text-[11px] font-medium uppercase tracking-wide text-gym-secondary">Fecha de Nacimiento</label>
                </div>
                <div className="relative">
                  <input 
                    type="date" 
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full h-16 bg-gym-dark-2 border border-gym-border rounded-gym px-6 text-[18px] font-bold text-gym-primary focus:border-gym-green-accent outline-none text-center shadow-inner"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
