'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Check, Utensils, Flame, Search, ChevronRight } from 'lucide-react'
import { logNutritionEntry } from '@/app/actions/nutrition.actions'
import { getFoodCatalog } from '@/app/actions/catalog.actions'

interface LogMealDrawerProps {
  isOpen: boolean
  onClose: () => void
  mealType: string
  selectedDate: string
  onSaveSuccess: (entry: any) => void
}

const MEAL_LABELS: Record<string, string> = {
  breakfast: 'Desayuno',
  lunch: 'Comida',
  dinner: 'Cena',
  snack: 'Snacks'
}

export function LogMealDrawer({ isOpen, onClose, mealType, selectedDate, onSaveSuccess }: LogMealDrawerProps) {
  const [foodName, setFoodName] = useState('')
  const [calories, setCalories] = useState<number | ''>('')
  const [protein, setProtein] = useState<number | ''>('')
  const [carbs, setCarbs] = useState<number | ''>('')
  const [fat, setFat] = useState<number | ''>('')

  const [baseCals, setBaseCals] = useState<number>(0)
  const [baseProtein, setBaseProtein] = useState<number>(0)
  const [baseCarbs, setBaseCarbs] = useState<number>(0)
  const [baseFat, setBaseFat] = useState<number>(0)
  const [baseGrams, setBaseGrams] = useState<number>(100)
  const [selectedCatalogId, setSelectedCatalogId] = useState<string | null>(null)
  const [tab, setTab] = useState<'manual' | 'catalog'>('manual')
  const [catalogItems, setCatalogItems] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [grams, setGrams] = useState<number>(100)
  
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (isOpen) {
      loadCatalog()
    }
  }, [isOpen])

  const loadCatalog = async () => {
    try {
      const data = await getFoodCatalog()
      setCatalogItems(data)
    } catch (e) {
      console.error(e)
    }
  }

  const handleSelectFromCatalog = (item: any) => {
    setTab('manual')
    setFoodName(item.name)
    setSelectedCatalogId(item.id)
    setBaseCals(item.caloriesPer100g)
    setBaseProtein(item.proteinPer100g)
    setBaseCarbs(item.carbsPer100g)
    setBaseFat(item.fatPer100g)
    setBaseGrams(item.baseGrams || 100)
    
    // Set initial values based on default grams
    updateMacrosWithGrams(item.baseGrams || 100, item)
  }



  const updateMacrosWithGrams = (g: number, baseData?: any) => {
    const factor = g / (baseData?.baseGrams || baseGrams || 100)
    setCalories(Math.round((baseData?.caloriesPer100g || baseCals) * factor))
    setProtein(Number(((baseData?.proteinPer100g || baseProtein) * factor).toFixed(1)))
    setCarbs(Number(((baseData?.carbsPer100g || baseCarbs) * factor).toFixed(1)))
    setFat(Number(((baseData?.fatPer100g || baseFat) * factor).toFixed(1)))
    setGrams(g)
  }

  const handleSave = async () => {
    if (!foodName || !calories) return
    setIsSaving(true)
    
    try {
      const entry = {
        date: new Date(selectedDate).toISOString(),
        mealType: mealType as any,
        foodName,
        grams: Number(grams || 0),
        calories: Number(calories),
        proteinG: Number(protein || 0),
        carbsG: Number(carbs || 0),
        fatG: Number(fat || 0),
        catalogId: selectedCatalogId || undefined
      }
      
      let savedId = crypto.randomUUID()
      let finalEntry = null

      try {
        const saved = await logNutritionEntry(entry)
        savedId = saved.id
        finalEntry = saved
      } catch (e) {
        console.warn('[Offline] Failed to save to server, using local ID', e)
      }
      
      const mapped = {
        id: savedId,
        mealType: mealType,
        foodName: foodName,
        grams: Number(grams || 0),
        calories: Number(calories),
        proteinG: Number(protein || 0),
        carbsG: Number(carbs || 0),
        fatG: Number(fat || 0),
        catalogId: selectedCatalogId || undefined
      }
      
      onSaveSuccess(mapped)
      
      // Reset form & Close
      setFoodName('')
      setCalories('')
      setProtein('')
      setCarbs('')
      setFat('')
      
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
            className="fixed bottom-0 left-0 right-0 z-[70] h-[90vh] rounded-t-3xl bg-gym-dark-1 border-t border-gym-border p-6 pb-safe flex flex-col"
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <Utensils className="w-5 h-5 text-gym-green-accent" />
                <div>
                  <h3 className="text-[16px] font-bold text-gym-primary">
                    Agregar {MEAL_LABELS[mealType] || 'Comida'}
                  </h3>
                  <p className="text-[12px] text-gym-secondary">Personaliza los macros</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={handleSave}
                  disabled={isSaving || !foodName || !calories}
                  className="p-2 bg-gym-green-bg rounded-full text-white disabled:opacity-50 transition-colors"
                >
                  <Check className="w-5 h-5" />
                </button>
                <button onClick={onClose} className="p-2 bg-gym-dark-3 rounded-full text-gym-secondary hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex bg-gym-dark-2 rounded-xl p-1 mb-6">
              <button 
                onClick={() => setTab('manual')}
                className={`flex-1 h-9 rounded-lg text-[13px] font-medium transition-all ${tab === 'manual' ? 'bg-gym-dark-3 text-white shadow-sm' : 'text-gym-secondary'}`}
              >
                Manual
              </button>
              <button 
                onClick={() => setTab('catalog')}
                className={`flex-1 h-9 rounded-lg text-[13px] font-medium transition-all ${tab === 'catalog' ? 'bg-gym-dark-3 text-white shadow-sm' : 'text-gym-secondary'}`}
              >
                Catálogo
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-6 custom-scrollbar pb-10">
              {tab === 'catalog' ? (
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gym-secondary" />
                    <input 
                      type="text"
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      placeholder="Buscar en catálogo..."
                      className="w-full h-12 bg-gym-dark-2 border border-gym-border rounded-xl pl-12 pr-4 text-sm text-gym-primary outline-none focus:border-gym-green-accent"
                    />
                  </div>
                  <div className="space-y-2">
                    {catalogItems
                      .filter(i => i.name.toLowerCase().includes(search.toLowerCase()))
                      .map(item => (
                        <button 
                          key={item.id}
                          onClick={() => handleSelectFromCatalog(item)}
                          className="w-full bg-gym-dark-2 border border-gym-border rounded-xl p-4 flex items-center justify-between text-left group"
                        >
                          <div>
                            <h4 className="text-[14px] font-bold text-gym-primary group-hover:text-gym-green-accent transition-colors">{item.name}</h4>
                            <p className="text-[11px] text-gym-secondary">
                              {item.caloriesPer100g} kcal · P: {item.proteinPer100g}g · {item.baseGrams}g
                            </p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gym-muted" />
                        </button>
                      ))}
                  </div>
                </div>
              ) : (
                <>
                  {/* Food Name */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-medium uppercase tracking-wide text-gym-secondary px-1">Alimento</label>
                    <input 
                      type="text" 
                      value={foodName}
                      onChange={(e) => {
                        setFoodName(e.target.value)
                        setSelectedCatalogId(null) // Break link if manually editing name
                      }}
                      placeholder="Ej: Avena con proteína..."
                      className="w-full h-14 bg-gym-dark-2 border border-gym-border rounded-gym px-4 text-[15px] text-gym-primary focus:border-gym-green-accent outline-none"
                    />
                  </div>

                  {selectedCatalogId && (
                    <div className="space-y-2">
                      <label className="text-[11px] font-medium uppercase tracking-wide text-gym-green-accent px-1">Gramos a registrar</label>
                      <div className="relative">
                        <input 
                          type="number" 
                          value={grams}
                          onChange={(e) => updateMacrosWithGrams(Number(e.target.value))}
                          className="w-full h-14 bg-gym-dark-3 border border-gym-green-accent/30 rounded-gym px-4 text-[18px] font-bold text-gym-primary outline-none"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[12px] font-medium text-gym-muted">gramos</div>
                      </div>
                    </div>
                  )}

                  {/* Total Calories */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 px-1 text-orange-400">
                      <Flame className="w-4 h-4" />
                      <label className="text-[11px] font-medium uppercase tracking-wide">Calorías Totales *</label>
                    </div>
                    <div className="relative">
                      <input 
                        type="number" 
                        value={calories}
                        onChange={(e) => {
                          setCalories(Number(e.target.value))
                          if (!selectedCatalogId) setBaseCals(Number(e.target.value))
                        }}
                        placeholder="350"
                        className="w-full h-14 bg-gym-dark-2 border border-gym-border rounded-gym px-4 pr-12 text-[18px] font-bold text-gym-primary focus:border-orange-500 outline-none tabular-nums"
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[12px] font-medium text-gym-muted">kcal</div>
                    </div>
                  </div>
                </>
              )}

              <div className="h-[1px] w-full bg-gym-border my-2"></div>

              {/* Macros Grid */}
              <div className="grid grid-cols-3 gap-3">
                {/* Protein */}
                <div className="space-y-2">
                  <label className="text-[11px] font-medium uppercase tracking-wide text-[#3b82f6] px-1">Proteína</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      value={protein}
                      onChange={(e) => setProtein(Number(e.target.value))}
                      placeholder="0"
                      className="w-full h-12 bg-gym-dark-2 border border-gym-border rounded-lg px-3 pr-8 text-[15px] font-bold text-gym-primary focus:border-[#3b82f6] outline-none tabular-nums"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] font-medium text-gym-muted">g</div>
                  </div>
                </div>

                {/* Carbs */}
                <div className="space-y-2">
                  <label className="text-[11px] font-medium uppercase tracking-wide text-[#a855f7] px-1">Carbos</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      value={carbs}
                      onChange={(e) => setCarbs(Number(e.target.value))}
                      placeholder="0"
                      className="w-full h-12 bg-gym-dark-2 border border-gym-border rounded-lg px-3 pr-8 text-[15px] font-bold text-gym-primary focus:border-[#a855f7] outline-none tabular-nums"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] font-medium text-gym-muted">g</div>
                  </div>
                </div>

                {/* Fat */}
                <div className="space-y-2">
                  <label className="text-[11px] font-medium uppercase tracking-wide text-[#fbbf24] px-1">Grasas</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      value={fat}
                      onChange={(e) => setFat(Number(e.target.value))}
                      placeholder="0"
                      className="w-full h-12 bg-gym-dark-2 border border-gym-border rounded-lg px-3 pr-8 text-[15px] font-bold text-gym-primary focus:border-[#fbbf24] outline-none tabular-nums"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] font-medium text-gym-muted">g</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
