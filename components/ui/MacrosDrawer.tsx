'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

interface MacrosDrawerProps {
  isOpen: boolean
  onClose: () => void
  currentCalories: number
  currentProtein: number
  currentCarbs: number
  currentFat: number
  onSave: (cals: number, pro: number, carb: number, fat: number) => Promise<void>
}

export function MacrosDrawer({ isOpen, onClose, currentCalories, currentProtein, currentCarbs, currentFat, onSave }: MacrosDrawerProps) {
  const [calories, setCalories] = useState(currentCalories)
  const [protein, setProtein] = useState(currentProtein)
  const [carbs, setCarbs] = useState(currentCarbs)
  const [fat, setFat] = useState(currentFat)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    setCalories(currentCalories)
    setProtein(currentProtein)
    setCarbs(currentCarbs)
    setFat(currentFat)
  }, [isOpen, currentCalories, currentProtein, currentCarbs, currentFat])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await onSave(calories, protein, carbs, fat)
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
                <h3 className="text-[16px] font-bold text-gym-primary">Metas de Nutrición</h3>
                <p className="text-[12px] text-gym-secondary">Calcula tus requerimientos diarios</p>
              </div>
              <button onClick={onClose} className="p-2 bg-gym-dark-3 rounded-full text-gym-secondary hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex bg-gym-dark-2 rounded-gym border border-gym-border overflow-hidden">
                <div className="w-1/3 bg-gym-dark-3 p-3 flex items-center border-r border-gym-border"><span className="text-[13px] font-semibold text-gym-primary">Calorías</span></div>
                <input type="number" value={calories} onChange={e => setCalories(Number(e.target.value))} className="w-2/3 bg-transparent text-right p-3 text-[16px] font-bold tabular-nums text-gym-primary focus:outline-none" />
              </div>
              
              <div className="flex bg-gym-dark-2 rounded-gym border border-gym-border overflow-hidden">
                <div className="w-1/3 bg-gym-dark-3 p-3 flex items-center border-r border-gym-border"><span className="text-[13px] font-semibold text-gym-primary">Proteína (g)</span></div>
                <input type="number" value={protein} onChange={e => setProtein(Number(e.target.value))} className="w-2/3 bg-transparent text-right p-3 text-[16px] font-bold tabular-nums text-gym-primary focus:outline-none" />
              </div>

              <div className="flex bg-gym-dark-2 rounded-gym border border-gym-border overflow-hidden">
                <div className="w-1/3 bg-gym-dark-3 p-3 flex items-center border-r border-gym-border"><span className="text-[13px] font-semibold text-gym-primary">Carbos (g)</span></div>
                <input type="number" value={carbs} onChange={e => setCarbs(Number(e.target.value))} className="w-2/3 bg-transparent text-right p-3 text-[16px] font-bold tabular-nums text-gym-primary focus:outline-none" />
              </div>

              <div className="flex bg-gym-dark-2 rounded-gym border border-gym-border overflow-hidden">
                <div className="w-1/3 bg-gym-dark-3 p-3 flex items-center border-r border-gym-border"><span className="text-[13px] font-semibold text-gym-primary">Grasas (g)</span></div>
                <input type="number" value={fat} onChange={e => setFat(Number(e.target.value))} className="w-2/3 bg-transparent text-right p-3 text-[16px] font-bold tabular-nums text-gym-primary focus:outline-none" />
              </div>
            </div>

            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="w-full h-14 bg-gym-green-bg rounded-gym flex items-center justify-center text-[15px] font-semibold text-white disabled:opacity-50 mt-4"
            >
              {isSaving ? 'Guardando...' : 'Aplicar Metas'}
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
