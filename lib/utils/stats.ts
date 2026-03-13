import { differenceInDays, isSameDay, startOfDay } from 'date-fns'

/**
 * Calculates the current training streak in days.
 */
export function calculateCurrentStreak(sessionDates: Date[]): number {
  if (sessionDates.length === 0) return 0

  const sortedDates = [...sessionDates]
    .map(d => startOfDay(new Date(d)))
    .sort((a, b) => b.getTime() - a.getTime())

  // Remove duplicate days
  const uniqueDates: Date[] = []
  sortedDates.forEach(d => {
    if (uniqueDates.length === 0 || !isSameDay(d, uniqueDates[uniqueDates.length - 1])) {
      uniqueDates.push(d)
    }
  })

  const today = startOfDay(new Date())
  const lastSession = uniqueDates[0]

  // If last session was not today or yesterday, streak is broken
  const diffFromToday = differenceInDays(today, lastSession)
  if (diffFromToday > 1) return 0

  let streak = 1
  for (let i = 0; i < uniqueDates.length - 1; i++) {
    const current = uniqueDates[i]
    const next = uniqueDates[i + 1]
    
    if (differenceInDays(current, next) === 1) {
      streak++
    } else {
      break
    }
  }

  return streak
}

/**
 * Calculates the percentage change in volume between the last N days 
 * and the N days prior.
 */
export function calculateVolumeTrend(sessions: { volume: number, date: Date }[], days: number = 30): number {
  const now = new Date()
  const periodStart = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
  const priorStart = new Date(now.getTime() - 2 * days * 24 * 60 * 60 * 1000)

  const currentPeriodVolume = sessions
    .filter(s => s.date >= periodStart && s.date <= now)
    .reduce((sum, s) => sum + s.volume, 0)

  const priorPeriodVolume = sessions
    .filter(s => s.date >= priorStart && s.date < periodStart)
    .reduce((sum, s) => sum + s.volume, 0)

  if (priorPeriodVolume === 0) return currentPeriodVolume > 0 ? 100 : 0
  
  return ((currentPeriodVolume - priorPeriodVolume) / priorPeriodVolume) * 100
}
