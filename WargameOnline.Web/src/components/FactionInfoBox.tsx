import { Faction } from "../types/types";

type Props = {
  faction: Faction | null;
};

export default function FactionInfoBox({ faction }: Props) {
  if (!faction) return null;

  return (
    <div className="w-full max-w-3xl p-4 bg-slate-800 text-white rounded mt-6 shadow-lg space-y-6">
      {/* Immagine fazione */}
      {faction.image && (
        <img
          src={`/assets/factions/${faction.image}`}
          alt={faction.displayName || faction.name}
          className="w-full max-w-sm mx-auto rounded-md border border-slate-700"
        />
      )}

      {/* Nome fazione */}
      <h2 className="text-2xl font-bold text-center">
        {faction.displayName || faction.name}
      </h2>

      {/* Regole speciali */}
      {faction.armyRules && faction.armyRules.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold mb-2">🛡️ Regole speciali</h3>
          <ul className="list-disc list-inside space-y-1">
            {faction.armyRules.map((rule) => (
              <li key={rule.name}>
                <strong>{rule.name}</strong>: {rule.rule}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Incantesimi */}
      {faction.armySpells && faction.armySpells.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold mb-2">✨ Incantesimi disponibili</h3>
          <ul className="space-y-3">
            {faction.armySpells.map((spell) => (
              <li key={spell.name} className="border-l-4 border-blue-400 pl-3">
                <div className="font-bold text-blue-300">{spell.name}</div>
                <div className="text-sm text-slate-300 italic">{spell.flavourText}</div>
                <div className="text-sm">
                  <span className="text-white">Effetto:</span> {spell.effect} •
                  <span className="ml-2">Range:</span> {spell.rangeInCm} cm •
                  <span className="ml-2">Diff:</span> {spell.difficultyToCast}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
