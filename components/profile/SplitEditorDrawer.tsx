'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence, Reorder } from 'framer-motion'
import { X, Plus, Trash2, GripVertical, Check } from 'lucide-react'
import { upsertSplit, deleteSplit } from '@/app/actions/split.actions'

interface Exercise {
  id?: string
  name: string
  order: number
}

interface SplitEditorDrawerProps {
  isOpen: boolean
  onClose: () => void
  split?: {
    id: string
    name: string
    order: number
    exercises: Exercise[]
  }
  defaultOrder: number
}

export function SplitEditorDrawer({ isOpen, onClose, split, defaultOrder }: SplitEditorDrawerProps) {
  const [name, setName] = useState('')
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (split) {
      setName(split.name)
      setExercises([...split.exercises].sort((a, b) => a.order - b.order))
    } else {
      setName('')
      setExercises([])
    }
  }, [isOpen, split])

  const handleSave = async () => {
    if (!name.trim()) return
    setIsSaving(true)
    try {
      await upsertSplit({
        id: split?.id,
        name,
        order: split?.order ?? defaultOrder,
        exercises: exercises.map((ex, idx) => ({ ...ex, order: idx + 1 }))
      })
      onClose()
    } catch (e) {
      console.error(e)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!split?.id || !confirm('¿Estás seguro de eliminar este split?')) return
    setIsDeleting(true)
    try {
      await deleteSplit(split.id)
      onClose()
    } catch (e) {
      console.error(e)
    } finally {
      setIsDeleting(false)
    }
  }

  const addExercise = () => {
    setExercises([...exercises, { name: '', order: exercises.length + 1 }])
  }

  const removeExercise = (idx: number) => {
    setExercises(exercises.filter((_, i) => i !== idx))
  }

  const updateExerciseName = (idx: number, newName: string) => {
    const newExs = [...exercises]
    newExs[idx].name = newName
    setExercises(newExs)
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
            className="fixed bottom-0 left-0 right-0 z-[70] h-[90vh] rounded-t-3xl bg-gym-dark-1 border-t border-gym-border p-6 pb-safe flex flex-col"
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-[16px] font-bold text-gym-primary">
                  {split ? 'Editar Split' : 'Nuevo Split'}
                </h3>
                <p className="text-[12px] text-gym-secondary">Configura tus ejercicios</p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={handleSave}
                  disabled={isSaving || !name.trim()}
                  className="p-2 bg-gym-green-bg rounded-full text-white disabled:opacity-50"
                >
                  <Check className="w-5 h-5" />
                </button>
                <button onClick={onClose} className="p-2 bg-gym-dark-3 rounded-full text-gym-secondary hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content Sidebar Scrollable */}
            <div className="flex-1 overflow-y-auto space-y-6 pr-1 custom-scrollbar">
              {/* Split Name */}
              <div className="space-y-2">
                <label className="text-[11px] font-medium uppercase tracking-wide text-gym-secondary px-1">Nombre del Split</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: Push, Pecho y Tríceps..."
                  className="w-full h-14 bg-gym-dark-2 border border-gym-border rounded-gym px-4 text-[15px] text-gym-primary focus:border-gym-green-accent outline-none"
                />
              </div>

              {/* Exercises List */}
              <div className="space-y-4">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[11px] font-medium uppercase tracking-wide text-gym-secondary">Ejercicios</label>
                  <button 
                    onClick={addExercise}
                    className="flex items-center gap-1 text-[11px] font-bold text-gym-green-accent"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Agregar</span>
                  </button>
                </div>

                <Reorder.Group axis="y" values={exercises} onReorder={setExercises} className="space-y-3">
                  {exercises.map((ex, idx) => (
                    <Reorder.Item 
                      key={ex.id || `temp-${idx}`} 
                      value={ex}
                      className="flex items-center gap-3 bg-gym-dark-2 border border-gym-border rounded-gym p-3 group"
                    >
                      <div className="cursor-grab active:cursor-grabbing text-gym-muted">
                        <GripVertical className="w-4 h-4" />
                      </div>
                      <input 
                        type="text"
                        value={ex.name}
                        onChange={(e) => updateExerciseName(idx, e.target.value)}
                        placeholder="Nombre del ejercicio"
                        className="flex-1 bg-transparent border-none outline-none text-[14px] text-gym-primary placeholder:text-gym-muted"
                      />
                      <button 
                        onClick={() => removeExercise(idx)}
                        className="p-2 text-gym-muted hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </Reorder.Item>
                  ))}
                </Reorder.Group>

                {exercises.length === 0 && (
                  <div className="py-8 text-center bg-gym-dark-2/50 rounded-gym border border-dashed border-gym-border">
                    <p className="text-[13px] text-gym-secondary">No hay ejercicios aún.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            {split && (
              <div className="pt-4 mt-auto">
                <button 
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="w-full h-14 bg-red-500/10 border border-red-500/20 rounded-gym flex items-center justify-center text-[14px] font-semibold text-red-500"
                >
                  {isDeleting ? 'Eliminando...' : 'Eliminar Split'}
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
