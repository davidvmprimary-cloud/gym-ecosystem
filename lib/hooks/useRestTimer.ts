import { useState, useEffect, useRef, useCallback } from 'react'

export function useRestTimer(defaultSeconds = 90) {
  const [secondsLeft, setSecondsLeft] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [totalSeconds, setTotalSeconds] = useState(defaultSeconds)
  const intervalRef = useRef<NodeJS.Timeout>(undefined)

  const start = useCallback((seconds?: number) => {
    const duration = seconds ?? totalSeconds
    setTotalSeconds(duration)
    setSecondsLeft(duration)
    setIsRunning(true)
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate(30)
  }, [totalSeconds])

  const stop = useCallback(() => {
    setIsRunning(false)
    setSecondsLeft(0)
    clearInterval(intervalRef.current)
  }, [])

  useEffect(() => {
    if (!isRunning) return
    intervalRef.current = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          setIsRunning(false)
          // Notificación cuando termina
          if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate([100, 50, 100, 50, 200])
          
          if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
            new Notification('¡A trabajar!', { body: 'Descanso terminado', icon: '/icon-192.png' })
          }
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(intervalRef.current)
  }, [isRunning])

  const progress = totalSeconds > 0 ? (secondsLeft / totalSeconds) * 100 : 0
  const display = `${Math.floor(secondsLeft / 60)}:${String(secondsLeft % 60).padStart(2, '0')}`

  return { secondsLeft, isRunning, progress, display, start, stop, setTotalSeconds }
}
