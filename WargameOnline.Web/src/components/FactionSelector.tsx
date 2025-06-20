// FactionSelector.tsx
import React from 'react'

type Props = {
  faction: string
  setFaction: (f: string) => void
  factions: [string, { displayName?: string }][] // tipizzato generico
  clearSelection: () => void
}

export default function FactionSelector({ faction, setFaction, factions, clearSelection }: Props) {
  return (
    <select
      value={faction}
      onChange={(e) => {
        setFaction(e.target.value)
        clearSelection()
      }}
      className="w-full p-2 bg-slate-800 text-white rounded mb-4"
    >
      <option value="">-- Select Faction --</option>
      {factions.map(([key, val]) => (
        <option key={key} value={key}>
          {val.displayName || key}
        </option>
      ))}
    </select>
  )
}
