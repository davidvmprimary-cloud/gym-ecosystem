'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Check, Camera, User } from 'lucide-react'
import { updateIdentity } from '@/app/actions/user.actions'

interface IdentityDrawerProps {
  isOpen: boolean
  onClose: () => void
  currentName: string
  currentAvatar: string
}

export function IdentityDrawer({ isOpen, onClose, currentName, currentAvatar }: IdentityDrawerProps) {
  const [name, setName] = useState(currentName)
  const [avatarUrl, setAvatarUrl] = useState(currentAvatar)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    setName(currentName)
    setAvatarUrl(currentAvatar)
  }, [isOpen, currentName, currentAvatar])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await updateIdentity({ name, avatarUrl })
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
                <h3 className="text-[16px] font-bold text-gym-primary">Editar Perfil</h3>
                <p className="text-[12px] text-gym-secondary">Personaliza tu identidad</p>
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

            <div className="space-y-6">
              {/* Avatar Preview */}
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full border-2 border-gym-green-accent bg-gym-dark-3 flex items-center justify-center overflow-hidden">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-10 h-10 text-gym-muted" />
                    )}
                  </div>
                  <div className="absolute bottom-0 right-0 p-1.5 bg-gym-green-bg rounded-full border-2 border-gym-dark-1 shadow-lg">
                    <Camera className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>

              {/* Name Input */}
              <div className="space-y-2">
                <label className="text-[11px] font-medium uppercase tracking-wide text-gym-secondary px-1">Nombre Público</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Tu nombre..."
                  className="w-full h-14 bg-gym-dark-2 border border-gym-border rounded-gym px-4 text-[15px] text-gym-primary focus:border-gym-green-accent outline-none transition-colors shadow-inner"
                />
              </div>

              {/* Avatar URL Input */}
              <div className="space-y-2">
                <label className="text-[11px] font-medium uppercase tracking-wide text-gym-secondary px-1">URL de Foto de Perfil</label>
                <input 
                  type="text" 
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full h-14 bg-gym-dark-2 border border-gym-border rounded-gym px-4 text-[15px] text-gym-primary focus:border-gym-green-accent outline-none transition-colors shadow-inner"
                />
                <p className="text-[10px] text-gym-muted px-1 italic">Ingresa una URL directa a tu imagen (JPG, PNG o WebP).</p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
