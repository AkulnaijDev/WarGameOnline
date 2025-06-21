import { Game, ArmySummary, Army, Mode } from '../types/types'
import { useState } from 'react'

type Props = {
  armyName: string
  setArmyName: (name: string) => void
  game: Game | null
  setGame: (game: Game | null) => void
  games: Game[]
  savedArmies: ArmySummary[] | Army[]
  onSelectArmy: (id: number) => void | Promise<void>
}

export default function ArmyHeader({
  armyName,
  setArmyName,
  game,
  setGame,
  games
}: Props) {

  return (
    <div className="w-full max-w-2xl mb-3 space-y-3">
      <input
        className="p-2 text-black rounded w-full"
        placeholder="Name your army..."
        value={armyName}
        onChange={e => setArmyName(e.target.value)}
      />

      <select
        value={game?.id ?? ''}
        onChange={e => {
          const selected = games.find(g => g.id === Number(e.target.value)) || null
          setGame(selected)
        }}
        className="w-full p-2 bg-slate-800 text-white rounded"
      >
        <option value="">-- Select Game --</option>
        {games.map(g => (
          <option key={g.id} value={g.id}>
            {g.name}
          </option>
        ))}
      </select>
    </div>
  )
}
