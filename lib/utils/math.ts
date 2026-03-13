export function calculateVolume(weightKg: number, reps: number): number {
  return weightKg * reps
}

export function calculateExerciseVolume(sets: { weightKg: number; reps: number }[]): number {
  return sets.reduce((sum, s) => sum + calculateVolume(s.weightKg, s.reps), 0)
}

// Fórmula de Epley: 1RM = weight × (1 + reps/30)
// Más precisa para rangos de 1-10 reps
export function calculateEstimated1RM(weightKg: number, reps: number): number {
  if (reps === 1) return weightKg
  return weightKg * (1 + reps / 30)
}

export function calculateProgressPct(current: number, previous: number): number {
  if (previous === 0) return 0
  return ((current - previous) / previous) * 100
}

// Dado el volumen completado hasta ahora, el volumen anterior del ejercicio,
// el target de mejora y los sets restantes, sugiere el siguiente set.
export function suggestNextSet(params: {
  completedSets: { weightKg: number; reps: number }[]
  previousSets: { weightKg: number; reps: number }[]
  targetImprovementPct: number
  availableWeights?: number[]  // incrementos disponibles en el gym (ej: [2.5, 5, 10])
}): { weightKg: number; reps: number } {
  const { completedSets, previousSets, targetImprovementPct, availableWeights = [2.5, 5, 10] } = params

  const prevTotalVolume = calculateExerciseVolume(previousSets)
  const currentVolume = calculateExerciseVolume(completedSets)
  const setsLeft = previousSets.length - completedSets.length
  const targetTotalVolume = prevTotalVolume * (1 + targetImprovementPct / 100)
  const volumeNeeded = targetTotalVolume - currentVolume

  if (setsLeft <= 0 || volumeNeeded <= 0) {
    // Ya se cumplió el target, sugerir igual que la sesión anterior
    const correspondingSet = previousSets[completedSets.length]
    return correspondingSet ?? { weightKg: 0, reps: 0 }
  }

  // Volumen por set necesario para cumplir el target con los sets restantes
  const volumePerSetNeeded = volumeNeeded / setsLeft

  // Referencia: el set equivalente de la sesión anterior
  const referenceSet = previousSets[completedSets.length]
  if (!referenceSet) return { weightKg: 0, reps: 0 }

  // Intentar mantener las reps del set anterior y ajustar el peso
  const targetReps = referenceSet.reps
  const targetWeight = volumePerSetNeeded / targetReps

  // Redondear al incremento de peso más cercano disponible
  const roundedWeight = roundToAvailableWeight(targetWeight, availableWeights)

  return { weightKg: roundedWeight, reps: targetReps }
}

function roundToAvailableWeight(target: number, increments: number[]): number {
  const minIncrement = Math.min(...increments)
  return Math.round(target / minIncrement) * minIncrement
}

// Calcula un score de 0-100 basado en frecuencia de entrenamiento
// en los últimos 30 días vs la frecuencia ideal del split
export function calculateConsistencyScore(
  sessionDates: Date[],
  splitCount: number, // cuántos splits tiene el usuario (ej: 3 para PPL)
  lookbackDays = 30
): number {
  const now = new Date()
  const cutoff = new Date(now.getTime() - lookbackDays * 24 * 60 * 60 * 1000)
  const recentSessions = sessionDates.filter(d => d >= cutoff)

  // Frecuencia ideal: con descanso 1 día entre cada split
  // Para PPL serían ~10 sesiones en 30 días (ciclo de 3 días + 1 descanso = 4 días por ciclo)
  const idealSessionsPerCycle = splitCount
  const idealRestDays = 1
  const daysPerCycle = idealSessionsPerCycle + idealRestDays
  const idealSessions = Math.floor(lookbackDays / daysPerCycle) * idealSessionsPerCycle

  if (idealSessions === 0) return 100

  return Math.min(100, Math.round((recentSessions.length / idealSessions) * 100))
}
