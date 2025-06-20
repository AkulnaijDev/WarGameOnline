// src/components/UnitDetails.tsx
import React from 'react'
import { Unit } from '../types/types'

type Props = {
  unit: Unit | null
}

export default function UnitDetails({ unit }: Props) {
  if (!unit) return null

  return (
    <div className="p-3 bg-slate-800 border border-slate-700 text-sm mt-2 rounded">
      <p className="font-semibold text-white mb-1">{unit.name}</p>

      {unit.description && <p>{unit.description}</p>}

      {Array.isArray(unit.rules) && unit.rules.length > 0 && (
        <p className="text-slate-400 mt-1 italic">
          Rules: {unit.rules.join(', ')}
        </p>
      )}
    </div>
  )
}
