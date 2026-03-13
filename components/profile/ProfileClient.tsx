'use client'

import { useState } from 'react'
import { Plus, Dumbbell, ChevronRight, TrendingUp, Apple, Moon, Settings2, LogOut, Camera } from 'lucide-react'
import { SliderDrawer } from '@/components/ui/SliderDrawer'
import { MacrosDrawer } from '@/components/ui/MacrosDrawer'
import { updateUserPreferences } from '@/app/actions/workout.actions'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { SplitEditorDrawer } from '@/components/profile/SplitEditorDrawer'
import { IdentityDrawer } from '@/components/profile/IdentityDrawer'
import { BodyStatsDrawer } from '@/components/profile/BodyStatsDrawer'

export function ProfileClient({ user, memberSince, isLimited = false }: { user: any, memberSince?: string, isLimited?: boolean }) {
  const router = useRouter()
  // Config Modals State
  const [isImprovementOpen, setIsImprovementOpen] = useState(false)
  const [isRestDaysOpen, setIsRestDaysOpen] = useState(false)
  const [isMacrosOpen, setIsMacrosOpen] = useState(false)
  const [isSplitEditorOpen, setIsSplitEditorOpen] = useState(false)
  const [selectedSplit, setSelectedSplit] = useState<any>(null)
  const [isIdentityOpen, setIsIdentityOpen] = useState(false)
  const [isBodyStatsOpen, setIsBodyStatsOpen] = useState(false)

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const handleSaveImprovement = async (val: number) => {
    await updateUserPreferences({ defaultImprovementTarget: val })
  }

  const handleSaveRestDays = async (val: number) => {
    await updateUserPreferences({ maxRestDays: val })
  }

  const handleSaveMacros = async (cals: number, pro: number, carb: number, fat: number) => {
    await updateUserPreferences({ targetCalories: cals, targetProtein: pro, targetCarbs: carb, targetFat: fat })
  }

  const handleOpenNewSplit = () => {
    setSelectedSplit(null)
    setIsSplitEditorOpen(true)
  }

  const handleOpenEditSplit = (split: any) => {
    setSelectedSplit(split)
    setIsSplitEditorOpen(true)
  }

  return (
    <>
      {/* Identity Card */}
      <section 
        className="flex flex-col items-center mb-8 pt-4 cursor-pointer group"
        onClick={() => setIsIdentityOpen(true)}
      >
        <div className="relative mb-4 transition-transform group-active:scale-95">
          <div className="w-[80px] h-[80px] rounded-full border-2 border-gym-green-bg bg-gym-dark-3 flex items-center justify-center overflow-hidden">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-[26px] font-bold text-gym-primary">
                {user.name ? user.name.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div className="absolute bottom-0 right-0 w-[26px] h-[26px] bg-gym-dark-1 border border-gym-dark-3 rounded-full flex items-center justify-center shadow-lg cursor-pointer group-hover:bg-gym-dark-2 transition-colors">
            <Camera className="w-3.5 h-3.5 text-gym-secondary" />
          </div>
        </div>
        <h1 className="text-[22px] font-bold text-gym-primary group-hover:text-gym-green-accent transition-colors">
          {user.name || user.email?.split('@')[0]}
        </h1>
        {memberSince && <p className="text-[11px] text-gym-secondary mt-1">Miembro desde {memberSince}</p>}
      </section>

      <SliderDrawer
        isOpen={isImprovementOpen}
        onClose={() => setIsImprovementOpen(false)}
        title="Objetivo de Mejora Global"
        subtitle="Evolución porcentual meta para hipertrofia"
        min={0.5} max={10} step={0.5} unit="%"
        currentValue={user.defaultImprovementTarget}
        onSave={handleSaveImprovement}
      />

      <SliderDrawer
        isOpen={isRestDaysOpen}
        onClose={() => setIsRestDaysOpen(false)}
        title="Días Máximos de Descanso"
        subtitle="Antes de reiniciar el ciclo de entrenamiento"
        min={1} max={15} step={1} unit=" d"
        currentValue={user.maxRestDays}
        onSave={handleSaveRestDays}
      />

      <MacrosDrawer
        isOpen={isMacrosOpen}
        onClose={() => setIsMacrosOpen(false)}
        currentCalories={user.targetCalories || 2500}
        currentProtein={user.targetProtein || 160}
        currentCarbs={user.targetCarbs || 250}
        currentFat={user.targetFat || 70}
        onSave={handleSaveMacros}
      />

      <SplitEditorDrawer 
        isOpen={isSplitEditorOpen}
        onClose={() => setIsSplitEditorOpen(false)}
        split={selectedSplit}
        defaultOrder={(user.splits?.length || 0) + 1}
      />

      <IdentityDrawer 
        isOpen={isIdentityOpen}
        onClose={() => setIsIdentityOpen(false)}
        currentName={user.name || ''}
        currentAvatar={user.avatarUrl || ''}
      />

      <BodyStatsDrawer 
        isOpen={isBodyStatsOpen}
        onClose={() => setIsBodyStatsOpen(false)}
        currentWeight={user.weight || 0}
        currentHeight={user.height || 0}
      />

      {/* Training Program */}
      {!isLimited && (
        <section className="mb-10">
          <div 
            onClick={() => setIsBodyStatsOpen(true)}
            className="bg-gym-dark-1 rounded-[14px] flex h-[68px] cursor-pointer hover:bg-gym-dark-2 transition-colors active:scale-[0.98]"
          >
            <div className="flex-1 flex flex-col items-center justify-center">
              <span className="text-[20px] font-bold tabular-nums text-gym-primary">{user.weight || '--'} kg</span>
              <span className="text-[11px] text-gym-secondary">Peso</span>
            </div>
            <div className="w-[1px] h-[32px] bg-gym-border self-center"></div>
            <div className="flex-1 flex flex-col items-center justify-center">
              <span className="text-[20px] font-bold tabular-nums text-gym-primary">{user.height || '--'} cm</span>
              <span className="text-[11px] text-gym-secondary">Altura</span>
            </div>
            <div className="w-[1px] h-[32px] bg-gym-border self-center"></div>
            <div className="flex-1 flex flex-col items-center justify-center">
              <span className="text-[20px] font-bold tabular-nums text-gym-primary">
                {user.birthDate ? new Date().getFullYear() - new Date(user.birthDate).getFullYear() : '--'} a
              </span>
              <span className="text-[11px] text-gym-secondary">Edad</span>
            </div>
          </div>
        </section>
      )}

      {/* Training Program */}
      {!isLimited && (
        <section className="mb-8">
          <div className="flex justify-between items-end mb-2">
            <div>
              <h2 className="text-[11px] font-medium uppercase tracking-wide text-gym-secondary">Mi Programa</h2>
              <p className="text-[11px] text-gym-secondary mt-0.5">La secuencia de tu rutina</p>
            </div>
            <button 
              onClick={handleOpenNewSplit}
              className="flex items-center gap-1 text-[12px] font-medium text-gym-green-accent"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nuevo split</span>
            </button>
          </div>
          
          <div className="bg-gym-dark-1 rounded-[14px] overflow-hidden">
            {user.splits?.map((split: any) => (
              <div 
                key={split.id} 
                onClick={() => handleOpenEditSplit(split)}
                className="flex items-center px-4 h-[48px] border-b border-gym-border active:bg-gym-dark-2 cursor-pointer transition-colors"
              >
                <Dumbbell className="w-4 h-4 text-gym-secondary mr-3" />
                <div className="flex-1 flex items-center">
                  <span className="text-[14px] text-gym-primary">{split.name}</span>
                  <span className="mx-1.5 text-[14px] text-gym-muted">•</span>
                  <span className="text-[14px] text-gym-secondary">{split.exercises?.length || 0} ejercicios</span>
                </div>
                <div className="w-[6px] h-[6px] rounded-full bg-gym-green-accent mr-4"></div>
                <ChevronRight className="w-3.5 h-3.5 text-gym-muted" />
              </div>
            ))}

            {/* Add Split placeholder */}
            <div 
              onClick={handleOpenNewSplit}
              className="flex items-center px-4 h-[48px] active:bg-gym-dark-2 cursor-pointer"
            >
              <div className="w-4 h-4 flex items-center justify-center mr-3">
                <div className="w-[2px] h-full bg-gym-muted rounded-full opacity-50 border-l border-dashed border-gym-secondary"></div>
              </div>
              <span className="text-[14px] text-gym-secondary flex-1">+ Agregar split</span>
            </div>
          </div>
        </section>
      )}

      {/* Configuration */}
      {!isLimited && (
        <section className="mb-8">
          <h2 className="text-[11px] font-medium uppercase tracking-wide text-gym-secondary mb-2 px-1">Configuración</h2>
          <div className="bg-gym-dark-1 rounded-[14px] overflow-hidden">
            {/* Improvement Target */}
            <button onClick={() => setIsImprovementOpen(true)} className="w-full flex items-center px-4 h-[64px] border-b border-gym-border active:bg-gym-dark-2 text-left">
              <TrendingUp className="w-5 h-5 text-gym-green-accent mr-4" />
              <div className="flex-1">
                <p className="text-[14px] text-gym-primary">Objetivo de mejora</p>
                <p className="text-[11px] text-gym-secondary">{user.defaultImprovementTarget}% por defecto · por ejercicio</p>
              </div>
              <ChevronRight className="w-4 h-4 text-gym-muted" />
            </button>
            
            {/* Nutrition Targets */}
            <button onClick={() => setIsMacrosOpen(true)} className="w-full flex items-center px-4 h-[64px] border-b border-gym-border active:bg-gym-dark-2 text-left">
              <Apple className="w-5 h-5 text-gym-green-accent mr-4" />
              <div className="flex-1">
                <p className="text-[14px] text-gym-primary">Metas de nutrición</p>
                <p className="text-[11px] text-gym-secondary">{user.targetCalories} kcal · {user.targetProtein}g proteína</p>
              </div>
              <ChevronRight className="w-4 h-4 text-gym-muted" />
            </button>
            
            {/* Rest Days limits */}
            <button onClick={() => setIsRestDaysOpen(true)} className="w-full flex items-center px-4 h-[64px] active:bg-gym-dark-2 text-left">
              <Moon className="w-5 h-5 text-gym-secondary mr-4" />
              <div className="flex-1">
                <p className="text-[14px] text-gym-primary">Días de descanso máximo</p>
                <p className="text-[11px] text-gym-secondary">{user.maxRestDays} días antes de reiniciar ciclo</p>
              </div>
              <ChevronRight className="w-4 h-4 text-gym-muted" />
            </button>
          </div>
        </section>
      )}

      {/* Actions */}
      <section className="mb-12">
        <div className="bg-gym-dark-1 rounded-[14px] overflow-hidden">
          {!isLimited && (
            <button className="w-full flex items-center px-4 h-[56px] border-b border-gym-border active:bg-gym-dark-2 text-left">
              <Settings2 className="w-5 h-5 text-gym-secondary mr-4" />
              <span className="text-[14px] text-gym-primary flex-1">Editar perfil</span>
              <ChevronRight className="w-4 h-4 text-gym-muted" />
            </button>
          )}
          
          <button onClick={handleLogout} className="w-full flex items-center px-4 h-[56px] active:bg-gym-dark-2 text-left">
            <LogOut className="w-5 h-5 text-red-500 mr-4" />
            <span className="text-[14px] text-red-500 font-medium flex-1">Cerrar sesión</span>
          </button>
        </div>
      </section>
    </>
  )
}
