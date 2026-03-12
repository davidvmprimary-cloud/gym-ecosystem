export interface SuggestParams {
  completedSetsVolume: number
  previousSessionTotalVolume: number
  improvementTargetRatio: number // e.g., 0.025 for 2.5%
  remainingSets: number
}

export interface SetSuggestion {
  suggestedWeightKg: number
  suggestedReps: number
}

/**
 * Calculates the suggested weight and reps for the next set to meet the target volume.
 */
export function suggestNextSet({
  completedSetsVolume,
  previousSessionTotalVolume,
  improvementTargetRatio,
  remainingSets,
}: SuggestParams): SetSuggestion {
  if (remainingSets <= 0) return { suggestedWeightKg: 0, suggestedReps: 0 }

  const targetVolume = previousSessionTotalVolume * (1 + improvementTargetRatio)
  const requiredRemainingVolume = targetVolume - completedSetsVolume

  if (requiredRemainingVolume <= 0) {
    // Already met the target, suggest maintenance
    return { suggestedWeightKg: 0, suggestedReps: 0 }
  }

  // A simple heuristic: distribute remaining required volume evenly
  const volumePerSet = requiredRemainingVolume / remainingSets

  // Assuming a generic default weight if no history, but ideally, 
  // we would base it on the previous set's weight.
  // For simplicity, we just return the volume required. 
  // In a real scenario, we calculate based on the previous logged weight.
  
  // As a mock behavior: we suggest 10 reps, and derive the weight.
  const suggestedReps = 10
  const suggestedWeightKg = Math.ceil((volumePerSet / suggestedReps) / 2.5) * 2.5 // round to nearest 2.5kg

  return { suggestedWeightKg, suggestedReps }
}
