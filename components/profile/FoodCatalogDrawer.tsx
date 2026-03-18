'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Check, Search, Plus, Trash2, Edit2, Utensils, Flame } from 'lucide-react'
import { upsertCatalogItem, deleteCatalogItem, getFoodCatalog } from '@/app/actions/catalog.actions'
import { useSync } from '@/hooks/useSync'

interface FoodCatalogDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export function FoodCatalogDrawer({ isOpen, onClose }: FoodCatalogDrawerProps) {
  const [items, setItems] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  
  // Form State
  const [name, setName] = useState('')
  const [calories, setCalories] = useState<number | ''>('')
  const [protein, setProtein] = useState<number | ''>('')
  const [carbs, setCarbs] = useState<number | ''>('')
  const [fat, setFat] = useState<number | ''>('')
  const [baseGrams, setBaseGrams] = useState<number>(100)

  const { isOnline, addPendingAction } = useSync()

  useEffect(() => {
    if (isOpen) {
      loadCatalog()
    }
  }, [isOpen])

  const loadCatalog = async () => {
    try {
      const data = await getFoodCatalog()
      setItems(data)
    } catch (e) {
      console.error(e)
    }
  }

  const handleEdit = (item: any) => {
    setEditingItem(item)
    setName(item.name)
    setCalories(item.caloriesPer100g)
    setProtein(item.proteinPer100g)
    setCarbs(item.carbsPer100g)
    setFat(item.fatPer100g)
    setBaseGrams(item.baseGrams || 100)
    setIsEditing(true)
  }

  const handleAddNew = () => {
    setEditingItem(null)
    setName('')
    setCalories('')
    setProtein('')
    setCarbs('')
    setFat('')
    setBaseGrams(100)
    setIsEditing(true)
  }

  const handleSave = async () => {
    if (!name || calories === '') return
    
    const payload = {
      id: editingItem?.id,
      name,
      caloriesPer100g: Number(calories),
      proteinPer100g: Number(protein || 0),
      carbsPer100g: Number(carbs || 0),
      fatPer100g: Number(fat || 0),
      baseGrams: Number(baseGrams)
    }

    try {
      if (!isOnline) {
        await addPendingAction('SYNC_CATALOG', payload)
        // Optimistic UI
        if (editingItem) {
          setItems(prev => prev.map(i => i.id === editingItem.id ? { ...i, ...payload } : i))
        } else {
          setItems(prev => [...prev, { ...payload, id: crypto.randomUUID() }])
        }
        setIsEditing(false)
        return
      }

      await upsertCatalogItem(payload)
      await loadCatalog()
      setIsEditing(false)
    } catch (e) {
      console.error(e)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este alimento del catálogo?')) return
    
    try {
      if (!isOnline) {
        // Pending action for delete doesn't exist yet but we could add it
        setItems(prev => prev.filter(i => i.id !== id))
        return
      }
      await deleteCatalogItem(id)
      await loadCatalog()
    } catch (e) {
      console.error(e)
    }
  }

  const filteredItems = items.filter(i => i.name.toLowerCase().includes(search.toLowerCase()))

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
            className="fixed bottom-0 left-0 right-0 z-[70] h-[90vh] rounded-t-3xl bg-gym-dark-1 border-t border-gym-border p-6 pb-safe flex flex-col"
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <Utensils className="w-5 h-5 text-gym-green-accent" />
                <h3 className="text-[18px] font-bold text-gym-primary">Catálogo Personal</h3>
              </div>
              <button 
                onClick={onClose} 
                className="p-2 bg-gym-dark-3 rounded-full text-gym-secondary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {isEditing ? (
              <div className="flex-1 overflow-y-auto space-y-6">
                <div className="space-y-2">
                  <label className="text-[11px] uppercase text-gym-secondary px-1">Nombre del Alimento</label>
                  <input 
                    type="text" 
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Ej: Avena Integral"
                    className="w-full h-14 bg-gym-dark-2 border border-gym-border rounded-gym px-4 text-gym-primary outline-none focus:border-gym-green-accent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[11px] uppercase text-gym-secondary px-1">Calorías (por g)</label>
                    <div className="relative">
                      <input 
                        type="number" 
                        value={calories}
                        onChange={e => setCalories(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full h-12 bg-gym-dark-2 border border-gym-border rounded-lg px-4 pr-12 text-gym-primary outline-none focus:border-orange-500"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[12px] text-gym-muted">kcal</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] uppercase text-gym-secondary px-1">Base Gramos</label>
                    <div className="relative">
                      <input 
                        type="number" 
                        value={baseGrams}
                        onChange={e => setBaseGrams(Number(e.target.value))}
                        className="w-full h-12 bg-gym-dark-2 border border-gym-border rounded-lg px-4 pr-10 text-gym-primary outline-none focus:border-gym-secondary"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[12px] text-gym-muted">g</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase text-[#3b82f6] px-1">Prot</span>
                    <input type="number" value={protein} onChange={e => setProtein(e.target.value === '' ? '' : Number(e.target.value))} className="w-full h-10 bg-gym-dark-2 border border-gym-border rounded-lg px-2 text-gym-primary text-sm" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase text-[#a855f7] px-1">Carb</span>
                    <input type="number" value={carbs} onChange={e => setCarbs(e.target.value === '' ? '' : Number(e.target.value))} className="w-full h-10 bg-gym-dark-2 border border-gym-border rounded-lg px-2 text-gym-primary text-sm" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase text-[#fbbf24] px-1">Grasa</span>
                    <input type="number" value={fat} onChange={e => setFat(e.target.value === '' ? '' : Number(e.target.value))} className="w-full h-10 bg-gym-dark-2 border border-gym-border rounded-lg px-2 text-gym-primary text-sm" />
                  </div>
                </div>

                <div className="flex gap-3 mt-8">
                  <button 
                    onClick={() => setIsEditing(false)}
                    className="flex-1 h-12 rounded-gym bg-gym-dark-3 text-gym-primary font-bold"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={handleSave}
                    className="flex-1 h-12 rounded-gym bg-gym-green-bg text-white font-bold flex flex-row items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    Guardar
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="relative mb-6">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gym-secondary" />
                  <input 
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Buscar alimento..."
                    className="w-full h-12 bg-gym-dark-2 border border-gym-border rounded-xl pl-12 pr-4 text-sm text-gym-primary outline-none focus:border-gym-green-accent"
                  />
                </div>

                <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-1">
                  {filteredItems.map(item => (
                    <div key={item.id} className="bg-gym-dark-2 border border-gym-border rounded-xl p-4 flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="text-[15px] font-bold text-gym-primary">{item.name}</h4>
                        <p className="text-[11px] text-gym-secondary mt-0.5">
                           {item.caloriesPer100g} kcal · P: {item.proteinPer100g}g · C: {item.carbsPer100g}g · G: {item.fatPer100g}g ({item.baseGrams}g)
                        </p>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <button onClick={() => handleEdit(item)} className="p-2 text-gym-secondary hover:text-gym-green-accent transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(item.id)} className="p-2 text-gym-secondary hover:text-red-500 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {filteredItems.length === 0 && (
                    <div className="text-center py-12">
                      <p className="text-gym-secondary text-sm">No se encontraron alimentos</p>
                    </div>
                  )}
                </div>

                <button 
                  onClick={handleAddNew}
                  className="mt-6 w-full h-14 bg-gym-green-bg rounded-gym text-white font-bold flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Agregar Nuevo Item
                </button>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
