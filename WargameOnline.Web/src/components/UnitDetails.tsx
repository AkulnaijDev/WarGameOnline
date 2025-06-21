import { useTranslation } from "react-i18next";
import { Unit } from "../types/types";

type Props = {
  unit: Unit | null;
};

export default function UnitDetails({ unit }: Props) {
  if (!unit) return null;
  const { t } = useTranslation();
  return (
    <div className="p-3 bg-slate-800 border border-slate-700 text-sm mt-2 rounded">
      <p className="font-semibold text-white mb-1">{unit.name}</p>

      {unit.description && <p>{unit.description}</p>}

      {Array.isArray(unit.rules) && unit.rules.length > 0 && (
        <p className="text-slate-400 mt-1 italic">
          {t("rules")}
          {unit.rules.join(", ")}
        </p>
      )}
    </div>
  );
}
