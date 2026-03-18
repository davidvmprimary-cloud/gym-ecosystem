'use client'

import { useSync } from '@/hooks/useSync'
import { Wifi, WifiOff, RefreshCw } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export function SyncStatus() {
  const { isOnline, pendingCount } = useSync()

  if (isOnline && pendingCount === 0) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -20, opacity: 0 }}
        className="fixed top-2 left-1/2 -translate-x-1/2 z-[100] px-4 py-2 rounded-full bg-gym-dark-1 border border-gym-border shadow-2xl flex items-center gap-3"
      >
        {!isOnline ? (
          <>
            <WifiOff className="w-4 h-4 text-orange-500" />
            <span className="text-[12px] font-medium text-gym-primary">Modo Offline</span>
          </>
        ) : (
          <>
            <RefreshCw className="w-4 h-4 text-gym-green-accent animate-spin" />
            <span className="text-[12px] font-medium text-gym-primary">Sincronizando {pendingCount}...</span>
          </>
        )}
      </motion.div>
    </AnimatePresence>
  )
}
