// ArmyStartMenu.tsx
import React from 'react'

type Props = {
  canEdit: boolean
  onCreate: () => void
  onEdit: () => void
}

export default function ArmyStartMenu({ canEdit, onCreate, onEdit }: Props) {
  return (
    <div className="w-full flex-1 flex flex-col items-center justify-center text-center space-y-6 px-4">
      <h1 className="text-3xl font-bold text-white">⚔️ Army Creator</h1>
      <p className="text-slate-400">Cosa vuoi fare?</p>

      <div className="flex flex-col gap-4 mt-6">
        <button
          onClick={onCreate}
          className="bg-green-600 hover:bg-green-500 text-white py-4 px-6 rounded text-lg"
        >
          ➕ Crea nuova armata
        </button>

        <button
          onClick={onEdit}
          disabled={!canEdit}
          className={`py-4 px-6 rounded text-lg ${canEdit
              ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
              : 'bg-slate-600 text-slate-400 cursor-not-allowed'
            }`}
        >
          🛠️ Modifica armata salvata
        </button>
      </div>
    </div>
  )
}
