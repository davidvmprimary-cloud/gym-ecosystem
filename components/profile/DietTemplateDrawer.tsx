'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Check, Plus, Trash2, Layout, Apple, ChevronRight, Search } from 'lucide-react'
import { getFoodCatalog } from '@/app/actions/catalog.actions'
import { upsertDietTemplate, toggleFixedDiet } from '@/app/actions/diet.actions'
import { useSync } from '@/hooks/useSync'

interface DietTemplateDrawerProps {
  isOpen: boolean
  onClose: () => void
  user: any
}

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack']
const MEAL_LABELS: Record<string, string> = {
  breakfast: 'Desayuno',
  lunch: 'Comida',
  dinner: 'Cena',
  snack: 'Snacks'
}

export function DietTemplateDrawer({ isOpen, onClose, user }: DietTemplateDrawerProps) {
  const [templateItems, setTemplateItems] = useState<any[]>([])
  const [catalogItems, setCatalogItems] = useState<any[]>([])
  const [isFixedDietActive, setIsFixedDietActive] = useState(user.isFixedDietActive || false)
  const [isAddingItem, setIsAddingItem] = useState(false)
  const [search, setSearch] = useState('')
  
  const { isOnline, addPendingAction } = useSync()

  useEffect(() => {
    if (isOpen) {
      loadData()
    }
  }, [isOpen])

  const loadData = async () => {
    try {
      const catalog = await getFoodCatalog()
      setCatalogItems(catalog)
      // For now we assume a single template for simplicity, as per implementation plan
      // In a real scenario we'd fetch the specific template
    } catch (e) {
      console.error(e)
    }
  }

  const handleAddItem = (food: any) => {
    setTemplateItems(prev => [...prev, {
      catalogId: food.id,
      foodName: food.name,
      mealType: 'snack',
      grams: food.baseGrams || 100
    }])
    setIsAddingItem(false)
  }

  const handleRemoveItem = (index: number) => {
    setTemplateItems(prev => prev.filter((_, i) => i !== index))
  }

  const handleUpdateItem = (index: number, updates: any) => {
    setTemplateItems(prev => prev.map((item, i) => i === index ? { ...item, ...updates } : item))
  }

  const handleSave = async () => {
    const payload = {
      name: 'Dieta Fija',
      items: templateItems.map(i => ({
        catalogId: i.catalogId,
        mealType: i.mealType,
        grams: i.grams
      }))
    }

    try {
      if (!isOnline) {
        await addPendingAction('SYNC_DIET', payload)
        // Optimistic toggle
        await toggleFixedDiet(true)
        onClose()
        return
      }

      await upsertDietTemplate(payload)
      await toggleFixedDiet(true)
      onClose()
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            className="fixed bottom-0 left-0 right-0 z-[70] h-[90vh] rounded-t-3xl bg-gym-dark-1 border-t border-gym-border p-6 pb-safe flex flex-col"
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <Layout className="w-5 h-5 text-gym-green-accent" />
                <h3 className="text-[18px] font-bold text-gym-primary">Plantilla de Dieta Fija</h3>
              </div>
              <button onClick={onClose} className="p-2 bg-gym-dark-3 rounded-full text-gym-secondary"><X className="w-5 h-5" /></button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-6 custom-scrollbar pr-1">
              {/* Toggle Section */}
              <div className="bg-gym-dark-2 border border-gym-border rounded-xl p-4 flex items-center justify-between">
                <div>
                  <h4 className="text-[14px] font-bold text-gym-primary">Activar Dieta Fija</h4>
                  <p className="text-[11px] text-gym-secondary mt-0.5">Carga estos alimentos automáticamente cada día</p>
                </div>
                <button 
                  onClick={() => setIsFixedDietActive(!isFixedDietActive)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${isFixedDietActive ? 'bg-gym-green-bg' : 'bg-gym-dark-3'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${isFixedDietActive ? 'right-1' : 'left-1'}`} />
                </button>
              </div>

              {isAddingItem ? (
                <div className="space-y-4 pt-2">
                  <div className="flex items-center gap-2 mb-2">
                    <button onClick={() => setIsAddingItem(false)} className="text-gym-secondary text-sm">Atrás</button>
                    <h4 className="text-sm font-bold">Seleccionar del Catálogo</h4>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gym-secondary" />
                    <input 
                      type="text" value={search} onChange={e => setSearch(e.target.value)}
                      placeholder="Buscar..."
                      className="w-full h-10 bg-gym-dark-3 border border-gym-border rounded-lg pl-10 pr-4 text-sm outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    {catalogItems.filter(f => f.name.toLowerCase().includes(search.toLowerCase())).map(food => (
                      <button 
                        key={food.id} onClick={() => handleAddItem(food)}
                        className="w-full h-14 bg-gym-dark-2 border border-gym-border rounded-xl px-4 flex items-center justify-between hover:border-gym-green-accent transition-colors"
                      >
                        <span className="text-sm text-gym-primary">{food.name}</span>
                        <ChevronRight className="w-4 h-4 text-gym-muted" />
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center px-1">
                    <h4 className="text-[12px] font-bold uppercase text-gym-secondary">Alimentos en Plantilla</h4>
                    <button onClick={() => setIsAddingItem(true)} className="text-gym-green-accent text-[12px] font-bold flex items-center gap-1">
                      <Plus className="w-3 h-3" /> Agregar
                    </button>
                  </div>

                  <div className="space-y-3">
                    {templateItems.map((item, idx) => (
                      <div key={idx} className="bg-gym-dark-2 border border-gym-border rounded-xl p-4 space-y-4">
                        <div className="flex justify-between items-start">
                          <h5 className="text-[15px] font-bold text-gym-primary">{item.foodName}</h5>
                          <button onClick={() => handleRemoveItem(idx)} className="text-red-500/50 hover:text-red-500 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <select 
                            value={item.mealType}
                            onChange={e => handleUpdateItem(idx, { mealType: e.target.value })}
                            className="h-10 bg-gym-dark-3 border border-gym-border rounded-lg px-2 text-[12px] text-gym-primary outline-none"
                          >
                            {MEAL_TYPES.map(m => (
                              <option key={m} value={m}>{MEAL_LABELS[m]}</option>
                            ))}
                          </select>
                          <div className="relative">
                            <input 
                              type="number" value={item.grams}
                              onChange={e => handleUpdateItem(idx, { grams: Number(e.target.value) })}
                              className="w-full h-10 bg-gym-dark-3 border border-gym-border rounded-lg px-2 pr-8 text-[12px] text-gym-primary outline-none"
                            />
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-gym-muted">g</span>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {templateItems.length === 0 && (
                      <div className="text-center py-10 border-2 border-dashed border-gym-border rounded-2xl">
                        <Apple className="w-8 h-8 text-gym-muted mx-auto mb-2 opacity-20" />
                        <p className="text-gym-secondary text-[12px]">No hay alimentos en la plantilla</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {!isAddingItem && (
              <button 
                onClick={handleSave}
                className="mt-6 w-full h-14 bg-gym-green-bg text-white font-bold rounded-gym flex items-center justify-center gap-2 shadow-lg shadow-gym-green-bg/20"
              >
                <Check className="w-5 h-5" />
                Guardar Plantilla
              </button>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
