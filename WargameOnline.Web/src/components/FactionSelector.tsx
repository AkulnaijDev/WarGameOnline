import { Faction } from '../types/types'

type Props = {
  faction: Faction | null
  setFaction: (f: Faction | null) => void
  factions: Faction[]
}

export default function FactionSelector({ faction, setFaction, factions }: Props) {
  return (
    <div className="w-full max-w-2xl mb-1 space-y-3">
      <select
        value={faction?.id ?? ''}
        onChange={(e) => {
          const selected = factions.find(f => f.id === Number(e.target.value)) || null
          setFaction(selected)
        }}
        className="w-full p-2 bg-slate-800 text-white rounded"
      >
        <option value="">-- Seleziona una fazione --</option>
        {factions.map(f => (
          <option key={f.id} value={f.id}>
            {f.name}
          </option>
        ))}
      </select>
    </div>

  )
}
