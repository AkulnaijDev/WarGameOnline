// src/components/ArmyHeader.tsx
import React from 'react'
import { SavedArmy } from '../types/types'

type Props = {
  armyName: string
  setArmyName: (val: string) => void
  game: string
  setGame: (val: string) => void
  games: string[]
  savedArmies: SavedArmy[]
  onSelectArmy: (id: string) => void
}

export default function ArmyHeader({
  armyName,
  setArmyName,
  game,
  setGame,
  games,
  savedArmies,
  onSelectArmy,
}: Props) {
  return (
    <div className="w-full max-w-2xl space-y-3">
      <input
        className="p-2 text-black rounded w-full"
        placeholder="Name your army..."
        value={armyName}
        onChange={e => setArmyName(e.target.value)}
      />

      <select
        value={game}
        onChange={e => setGame(e.target.value)}
        className="w-full p-2 bg-slate-800 text-white rounded"
      >
        <option value="">-- Select Game --</option>
        {games.map(g => (
          <option key={g} value={g}>{g}</option>
        ))}
      </select>

      {game && savedArmies.length > 0 && (
        <select
          onChange={e => onSelectArmy(e.target.value)}
          defaultValue=""
          className="w-full p-2 bg-slate-800 text-white rounded"
        >
          <option value="">-- Load Saved Army --</option>
          {savedArmies.map(a => (
            <option key={a.id} value={a.id}>
              {a.name} ({a.faction})
            </option>
          ))}
        </select>
      )}
    </div>
  )
}
