import clsx from 'clsx'

interface MacroSummaryProps {
  calories: { current: number; target: number }
  protein: { current: number; target: number }
  carbs: { current: number; target: number }
  fat: { current: number; target: number }
}

export function MacroSummary({ calories, protein, carbs, fat }: MacroSummaryProps) {
  const calPercent = Math.min((calories.current / calories.target) * 100, 100)
  
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
      <h3 className="mb-4 font-semibold text-zinc-100">Resumen Diario</h3>
      
      {/* Calories */}
      <div className="mb-6">
        <div className="mb-2 flex justify-between text-sm">
          <span className="text-zinc-400">Calorías</span>
          <span className="font-medium text-zinc-100">{calories.current} / {calories.target} kcal</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800">
          <div 
            className="h-full bg-green-500 transition-all" 
            style={{ width: `${calPercent}%` }} 
          />
        </div>
      </div>

      {/* Macros */}
      <div className="grid grid-cols-3 gap-4">
        <MacroBar label="Proteína" current={protein.current} target={protein.target} color="bg-blue-500" />
        <MacroBar label="Carbos" current={carbs.current} target={carbs.target} color="bg-yellow-500" />
        <MacroBar label="Grasas" current={fat.current} target={fat.target} color="bg-red-500" />
      </div>
    </div>
  )
}

function MacroBar({ label, current, target, color }: { label: string, current: number, target: number, color: string }) {
  const percent = Math.min((current / target) * 100, 100)
  return (
    <div>
      <div className="mb-1 text-xs text-zinc-400">{label}</div>
      <div className="mb-2 text-sm font-medium text-zinc-100">{current}g <span className="text-zinc-500">/ {target}g</span></div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
        <div 
          className={clsx("h-full transition-all", color)} 
          style={{ width: `${percent}%` }} 
        />
      </div>
    </div>
  )
}
