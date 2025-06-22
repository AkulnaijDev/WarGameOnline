import { useTranslation } from "react-i18next";
import { Unit, Faction } from "../types/types";

type Props = {
  unit: Unit | null;
  faction?: Faction | null; // 👈 passiamo anche la fazione per matchare le regole
};

export default function UnitDetails({ unit, faction }: Props) {
  const { t } = useTranslation();
  if (!unit) return null;

  // Match regole dell’unità alla definizione in unitRules
  const resolvedRules = unit.rules?.map((ruleName) => {
    const match = faction?.unitRules?.find((r) => r.name === ruleName);
    return {
      name: ruleName,
      description: match?.rule || null,
    };
  }) || [];

  return (
    <div className="p-4 bg-slate-800 border border-slate-700 rounded text-sm space-y-4 mt-2 max-w-md">
      {/* Nome */}
      <p className="font-bold text-white text-lg">{unit.name}</p>

      {/* Immagine */}
      {unit.imagine && (
        <img
          src={`/assets/units/${unit.imagine}`}
          alt={unit.name}
          className="w-full rounded border border-slate-600"
        />
      )}

      {/* Descrizione */}
      {unit.description && (
        <p className="text-slate-300">{unit.description}</p>
      )}

      {/* Regole */}
      {resolvedRules.length > 0 && (
        <div>
          <p className="text-slate-400 font-semibold mb-1">{t("rules")}</p>
          <ul className="list-disc list-inside space-y-1">
            {resolvedRules.map((r) => (
              <li key={r.name}>
                <span className="text-white font-medium">{r.name}</span>
                {r.description && (
                  <>
                    <span className="text-slate-400"> – {r.description}</span>
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
