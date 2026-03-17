'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Trash2 } from 'lucide-react'

export const EXERCISE_COLORS = [
  '#ef4444', // Red
  '#f97316', // Orange
  '#eab308', // Yellow
  '#84cc16', // Lime
  '#22c55e', // Green
  '#06b6d4', // Cyan
  '#3b82f6', // Blue
  '#8b5cf6', // Violet
  '#d946ef', // Fuchsia
  '#ec4899', // Pink
]

interface ExerciseSettingsDrawerProps {
  isOpen: boolean
  onClose: () => void
  exerciseName: string
  currentImprovementTarget: number
  currentColor?: string | null
  currentMetadata?: any
  onSave: (data: { improvementTarget: number; color?: string | null; metadata?: any }) => Promise<void>
}

export function ExerciseSettingsDrawer({ 
  isOpen, onClose, exerciseName, currentImprovementTarget, currentColor, currentMetadata, onSave 
}: ExerciseSettingsDrawerProps) {
  const [target, setTarget] = useState(currentImprovementTarget)
  const [color, setColor] = useState<string | null>(currentColor || null)
  const [metadata, setMetadata] = useState<{key: string; value: string}[]>([])
  const [isSaving, setIsSaving] = useState(false)

  // Reset state when opened with new props
  useEffect(() => {
    setTarget(currentImprovementTarget)
    setColor(currentColor || null)
    if (currentMetadata && typeof currentMetadata === 'object') {
      setMetadata(Object.entries(currentMetadata).map(([k, v]) => ({ key: k, value: String(v) })))
    } else {
      setMetadata([])
    }
  }, [isOpen, currentImprovementTarget, currentColor, currentMetadata])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const metadataObj = metadata.reduce((acc, curr) => {
        if (curr.key.trim()) acc[curr.key.trim()] = curr.value.trim()
        return acc
      }, {} as Record<string, string>)

      await onSave({
        improvementTarget: target,
        color: color,
        metadata: Object.keys(metadataObj).length > 0 ? metadataObj : null
      })
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
              <div className="pt-4 border-t border-gym-border">
                <label className="block text-sm font-medium text-gym-primary mb-3">Color de Resaltado</label>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => setColor(null)}
                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${!color ? 'border-gym-primary text-gym-primary' : 'border-gym-dark-3 text-gym-secondary hover:border-gym-muted'}`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                  {EXERCISE_COLORS.map(c => (
                    <button
                      key={c}
                      onClick={() => setColor(c)}
                      style={{ backgroundColor: c }}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${color === c ? 'border-white scale-110' : 'border-transparent hover:scale-105'}`}
                    />
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-gym-border">
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm font-medium text-gym-primary">Metadatos (Ajustes)</label>
                  <button 
                    onClick={() => setMetadata([...metadata, { key: '', value: '' }])}
                    className="text-gym-green-accent text-xs flex items-center gap-1 font-semibold"
                  >
                    <Plus className="w-3 h-3" /> Añadir
                  </button>
                </div>
                
                <div className="space-y-3">
                  {metadata.length === 0 ? (
                    <p className="text-xs text-gym-muted italic mb-4">No hay metadatos. Añade altura, inclinación u otros ajustes específicos para esta máquina.</p>
                  ) : metadata.map((item, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <input 
                        type="text" 
                        placeholder="Propiedad (ej. Altura)" 
                        value={item.key}
                        onChange={(e) => {
                          const newMeta = [...metadata]
                          newMeta[idx].key = e.target.value
                          setMetadata(newMeta)
                        }}
                        className="flex-1 bg-gym-dark-3 border border-gym-border rounded-lg px-3 py-2 text-sm text-gym-primary focus:outline-none focus:border-gym-green-accent"
                      />
                      <input 
                        type="text" 
                        placeholder="Valor (ej. 5)" 
                        value={item.value}
                        onChange={(e) => {
                          const newMeta = [...metadata]
                          newMeta[idx].value = e.target.value
                          setMetadata(newMeta)
                        }}
                        className="flex-1 bg-gym-dark-3 border border-gym-border rounded-lg px-3 py-2 text-sm text-gym-primary focus:outline-none focus:border-gym-green-accent"
                      />
                      <button 
                        onClick={() => setMetadata(metadata.filter((_, i) => i !== idx))}
                        className="p-2 text-gym-secondary hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
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
