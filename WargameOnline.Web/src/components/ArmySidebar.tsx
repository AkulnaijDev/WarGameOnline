import { UnitWithCount, GameSystem } from "../types/types";
import { useTranslation } from "react-i18next";
import { useState } from "react";

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
  game?: GameSystem | null;
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
  game,
}: Props) {
  const { t } = useTranslation();

  const [selectedItemUnitMap, setSelectedItemUnitMap] = useState<Record<number, number | "">>({});

  const groupedUnits = selectedUnits.reduce((acc, unit) => {
    if (unit.items?.length) {
      const itemId = unit.items[0]?.itemId;
      const itemName = game?.items?.find((i) => i.id === itemId)?.name ?? "item";
      acc.push({ ...unit, label: `${unit.name} 🧪 (${itemName})` });
    } else {
      acc.push({ ...unit, label: unit.name });
    }
    return acc;
  }, [] as Array<UnitWithCount & { label: string }>);

  return (
    <div className="w-full h-full bg-slate-800 p-4 rounded border border-slate-700 space-y-4">
      <h2 className="text-lg font-semibold">{t("yourArmyText")}</h2>

      {groupedUnits.length === 0 ? (
        <p className="text-sm text-slate-400">{t("noUnitsAddedYet")}</p>
      ) : (
        <ul className="space-y-2">
          {groupedUnits.map((u, idx) => (
            <li
              key={`${u.name}-${idx}`}
              className="flex justify-between items-center border-b border-slate-600 pb-1"
            >
              <span className="flex-1">{u.label} ×{u.count}</span>
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

      {game?.items && game.items.length > 0 && (
        <div className="mt-4 border-t border-slate-600 pt-2 text-sm">
          <h4 className="font-semibold mb-2">🎒 Oggetti disponibili</h4>
          {game.items.map((item) => (
            <div key={item.id} className="flex items-center mb-2 space-x-2">
              <span className="flex-1">{item.name} ({item.cost.amount} pts)</span>
              <select
                className="text-xs px-1 py-0.5 rounded bg-slate-700 border"
                value={selectedItemUnitMap[item.id] ?? ""}
                onChange={(e) => {
                  const value = e.target.value === "" ? "" : Number(e.target.value);
                  setSelectedItemUnitMap((prev) => ({ ...prev, [item.id]: value }));
                }}
              >
                <option value="">— seleziona unità —</option>
                {selectedUnits.map((u, idx) =>
                  u.count > 0 &&
                  (item.reservedToUnitType.toLowerCase() === u.type.toLowerCase() ||
                    item.reservedToUnitType === "any") ? (
                    <option key={idx} value={idx}>
                      {u.name} ×{u.count}
                    </option>
                  ) : null
                )}
              </select>
              <button
                className="px-2 py-1 bg-green-600 rounded text-xs text-white"
                disabled={
                  selectedItemUnitMap[item.id] === "" ||
                  selectedItemUnitMap[item.id] === undefined
                }
                onClick={() => {
                  const unitIdx = selectedItemUnitMap[item.id] as number;
                  const unit = selectedUnits[unitIdx];
                  if (!unit) return;

                  const updatedUnits = [...selectedUnits];
                  updatedUnits[unitIdx] = {
                    ...unit,
                    count: unit.count - 1,
                  };

                  updatedUnits.push({
                    ...unit,
                    count: 1,
                    items: [{ itemId: item.id }],
                  });

                  setSelectedItemUnitMap((prev) => ({ ...prev, [item.id]: "" }));
                  // NOTA: se vuoi aggiornare lo state in ArmyCreator, passa un callback da lì
                }}
              >
                Assegna
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 border-t border-slate-600 pt-2 text-sm space-y-1">
        <p>
          {t("totalUnits")}
          <span className="font-semibold"> {totalCount}</span>
        </p>
        <p>
          {t("totalPoints")}
          <span className="font-semibold"> {totalPoints}</span>
        </p>
        {minUnits !== undefined && (
          <p>
            {t("minUnitsRequired")}
            <span className="font-semibold"> {minUnits}</span>
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
