import { Game, ArmySummary, Army, Mode } from '../types/types'

type Props = {
  game: Game | null
  savedArmies: ArmySummary[] | Army[]
  selectedArmyId: number | null
  onSelectArmy: (id: number) => void | Promise<void>
  mode: Mode // 👈 aggiunto!
}

export default function ArmyHeaderSavedArmies({
  game,
  savedArmies,
  selectedArmyId,
  onSelectArmy,
  mode
}: Props) {
  return (
    <div className="w-full max-w-2xl space-y-3">
      {mode !== 'create' &&  game && (
        <select
          value={selectedArmyId ?? ''}
          onChange={(e) => {
            const id = Number(e.target.value)
            if (id > 0) onSelectArmy(id)
          }}
          className="w-full p-2 bg-slate-800 text-white rounded mt-2"
        >
          {!selectedArmyId && (
            <option value="">-- Carica una lista salvata --</option>
          )}

          {savedArmies
            .filter((a) => a.gameId === game.id)
            .map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} (ID: {a.id})
              </option>
            ))}
        </select>
      )}
    </div>
  )
}
