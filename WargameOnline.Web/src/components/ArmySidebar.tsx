import { UnitWithCount } from "../types/types";
import { useTranslation } from "react-i18next";

type Props = {
  selectedUnits: UnitWithCount[];
  totalCount: number;
  totalPoints: number;
  thresholdStep: number;
  multiplier: number;
  basicValid: boolean;
  dynamicValid: boolean;
  violations: string[];
  minUnits?: number;
  selectedArmyId: number | null;
  onChangeCount: (unitName: string, delta: number) => void;
  onExport: () => void;
  onSave: () => void;
  onDelete: () => void;
  isSaveDisabled: boolean;
};

export default function ArmySidebar({
  selectedUnits,
  totalCount,
  totalPoints,
  thresholdStep,
  multiplier,
  basicValid,
  dynamicValid,
  violations,
  minUnits,
  selectedArmyId,
  onChangeCount,
  onExport,
  onSave,
  onDelete,
  isSaveDisabled,
}: Props) {
  const { t } = useTranslation();

  return (
    <div className="w-full md:w-80 bg-slate-800 p-4 rounded border border-slate-700 space-y-4">
      <h2 className="text-lg font-semibold">{t("yourArmyText")}</h2>

      {selectedUnits.length === 0 ? (
        <p className="text-sm text-slate-400">{t("noUnitsAddedYet")}</p>
      ) : (
        <ul className="space-y-2">
          {selectedUnits.map((u) => (
            <li
              key={u.name}
              className="flex justify-between items-center border-b border-slate-600 pb-1"
            >
              <span className="flex-1">
                {u.name} ×{u.count}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onChangeCount(u.name, -1)}
                  className="text-red-400 hover:text-red-300"
                >
                  ➖
                </button>
                <button
                  onClick={() => onChangeCount(u.name, +1)}
                  className="text-green-400 hover:text-green-300"
                >
                  ➕
                </button>
                <button
                  onClick={() => onChangeCount(u.name, -u.count)}
                  className="text-slate-400 hover:text-red-500"
                >
                  🗑️
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4 border-t border-slate-600 pt-2 text-sm space-y-1">
        <p>
          {t("totalUnits")}
          <span className="font-semibold">{totalCount}</span>
        </p>
        <p>
          {t("totalPoints")}
          <span className="font-semibold">{totalPoints}</span>
        </p>
        {minUnits !== undefined && (
          <p>
            {t("minUnitsRequired")}
            <span className="font-semibold">{minUnits}</span>
          </p>
        )}
        {thresholdStep > 0 && (
          <p>
            {t("thresholdRule")}
            {thresholdStep} pts → ×{multiplier}
          </p>
        )}
        <p
          className={`font-semibold ${
            basicValid && dynamicValid ? "text-green-400" : "text-red-400"
          }`}
        >
          {basicValid && dynamicValid
            ? t("allConstraintsSatisfied")
            : t("constraintsViolated")}
        </p>

        {!dynamicValid && (
          <ul className="text-xs text-red-300 list-disc list-inside mt-1 space-y-1">
            {violations.map((v, idx) => (
              <li key={idx}>{v}</li>
            ))}
          </ul>
        )}

        <div className="pt-4 flex flex-col gap-2">
          <button
            onClick={onExport}
            className="py-2 w-full bg-indigo-600 hover:bg-indigo-500 text-white text-sm rounded disabled:opacity-50"
            disabled={
              selectedUnits.length === 0 || !basicValid || !dynamicValid
            }
          >
            {t("downloadPDF")}
          </button>

          <button
            onClick={onSave}
            className="py-2 w-full bg-green-600 hover:bg-green-500 text-white text-sm rounded disabled:opacity-50"
            disabled={isSaveDisabled}
          >
            {selectedArmyId ? t("saveChanges") : t("saveArmy")}
          </button>

          {selectedArmyId && (
            <button
              onClick={onDelete}
              className="py-2 w-full bg-red-600 hover:bg-red-500 text-white text-sm rounded"
            >
              {t("deleteArmy")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
