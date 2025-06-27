import { useTranslation } from "react-i18next";
import { useState } from "react";
import { GameSystem, UnitWithItem } from "../types/types";

type Props = {
  selectedUnits: UnitWithItem[];
  totalCount: number;
  totalPoints: number;
  thresholdStep: number;
  multiplier: number;
  basicValid: boolean;
  dynamicValid: boolean;
  violations: string[];
  minUnits?: number;
  selectedArmyId: number | null;
  onExport: () => void;
  onSave: () => void;
  onDelete: () => void;
  isSaveDisabled: boolean;
  game?: GameSystem | null;
  onAssignItem: (itemId: number, unitName: string) => void;
  onRemoveItemFromUnit: (itemId: number, unitIndex: number) => void;
  onRemoveSpecificUnit: (index: number) => void;
  onAddUnit: (unit: UnitWithItem) => void;
  onRemoveUnitsByName:(unitName: string) => void;
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
  onExport,
  onSave,
  onDelete,
  isSaveDisabled,
  game,
  onAssignItem,
  onRemoveItemFromUnit,
  onRemoveSpecificUnit,
  onAddUnit,
  onRemoveUnitsByName
}: Props) {
  const { t } = useTranslation();
  const [selectedItemUnitMap, setSelectedItemUnitMap] = useState<
    Record<number, string>
  >({});

  const items = game?.items ?? [];
  const isSingleton =
    game?.itemsRule?.itemPlayability?.itemsInSingleton ?? false;
  const howManyPerUnit = game?.itemsRule?.itemPlayability?.howManyPerUnit ?? 1;

  const groupedUnits = selectedUnits.reduce(
    (acc, unit, index) => {
      const hasItems = unit.items && unit.items.length > 0;
      const item = hasItems
        ? items.find((i) => i.id === unit.items![0].itemId)
        : null;

      if (hasItems) {
        acc.push({
          label: `${unit.name} 🧪 (${item?.name ?? "?"})`,
          unit,
          originalIndex: index,
          isGrouped: false,
          groupIndices: [index],
        });
      } else {
        const existing = acc.find(
          (u) =>
            u.unit.name === unit.name && !u.unit.items?.length && u.isGrouped
        );
        if (existing) {
          existing.groupIndices.push(index);
        } else {
          acc.push({
            label: unit.name,
            unit,
            isGrouped: true,
            groupIndices: [index],
          });
        }
      }
      return acc;
    },
    [] as Array<{
      label: string;
      unit: UnitWithItem;
      isGrouped: boolean;
      groupIndices: number[];
      originalIndex?: number;
    }>
  );

  return (
    <div className="w-full h-full bg-slate-800 p-4 rounded border border-slate-700 space-y-4">
      <h2 className="text-lg font-semibold">{t("yourArmyText")}</h2>

      {groupedUnits.length === 0 ? (
        <p className="text-sm text-slate-400">{t("noUnitsAddedYet")}</p>
      ) : (
        <ul className="space-y-2">
          {groupedUnits.map((u, idx) => (
            <li
              key={`${u.label}-${idx}`}
              className="flex justify-between items-center border-b border-slate-600 pb-1"
            >
              <span className="flex-1">
                {u.label} ×{u.groupIndices.length}
              </span>
              <div className="flex items-center gap-2">
                {u.unit.items?.length ? (
                  <>
                    <button
                      title="Rimuovi solo l’oggetto"
                      onClick={() => {
                        const itemId = u.unit.items?.[0]?.itemId;
                        if (
                          itemId !== undefined &&
                          u.originalIndex !== undefined
                        ) {
                          onRemoveItemFromUnit(itemId, u.originalIndex);
                        }
                      }}
                      className="text-yellow-400 hover:text-yellow-300 text-sm"
                    >
                      🎯
                    </button>
                    <button
                      title="Rimuovi unità"
                      onClick={() => {
                        if (u.originalIndex !== undefined) {
                          onRemoveSpecificUnit(u.originalIndex);
                        }
                      }}
                      className="text-red-400 hover:text-red-300 text-sm"
                    >
                      🗑️
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      title="Aggiungi una copia"
                      onClick={() => onAddUnit(u.unit)}
                      className="text-green-400 hover:text-green-300 text-sm"
                    >
                      ➕
                    </button>
                    <button
                      title="Rimuovi una copia"
                      onClick={() => {
                        const lastIndex = u.groupIndices.at(-1);
                        if (lastIndex !== undefined)
                          onRemoveSpecificUnit(lastIndex);
                      }}
                      className="text-yellow-400 hover:text-yellow-300 text-sm"
                    >
                      ➖
                    </button>
                    <button
                      title="Rimuovi tutte le copie"
                      onClick={() =>
                        onRemoveUnitsByName(u.unit.name)
                      }
                      className="text-red-400 hover:text-red-300 text-sm"
                    >
                      🗑️
                    </button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {items.length > 0 && (
        <div className="mt-4 border-t border-slate-600 pt-2 text-sm">
          <h4 className="font-semibold mb-2">🎒 Oggetti disponibili</h4>
          {items.map((item) => {
            const assignedCount = selectedUnits.filter((u) =>
              u.items?.some((i) => i.itemId === item.id)
            ).length;
            const isItemSingletonAssigned = isSingleton && assignedCount >= 1;

            const compatible = selectedUnits.filter(
              (u) =>
                (!u.items || u.items.length < howManyPerUnit) &&
                (item.reservedToUnitType === "any" ||
                  u.type === item.reservedToUnitType)
            );

            const uniqueAssignable = Array.from(
              new Map(compatible.map((u) => [u.name, u])).values()
            );

            return (
              <div key={item.id} className="flex items-center mb-2 space-x-2">
                <span className="flex-1">
                  {item.name} ({item.cost.amount} pts)
                </span>
                <select
                  className="text-xs px-1 py-0.5 rounded bg-slate-700 border"
                  value={selectedItemUnitMap[item.id] ?? ""}
                  onChange={(e) =>
                    setSelectedItemUnitMap((prev) => ({
                      ...prev,
                      [item.id]: e.target.value,
                    }))
                  }
                  disabled={isItemSingletonAssigned}
                >
                  <option value="">— seleziona unità —</option>
                  {uniqueAssignable.map((u) => (
                    <option key={u.name} value={u.name}>
                      {u.name}
                    </option>
                  ))}
                </select>
                <button
                  className="px-2 py-1 bg-green-600 rounded text-xs text-white"
                  disabled={
                    !selectedItemUnitMap[item.id] || isItemSingletonAssigned
                  }
                  onClick={() => {
                    const unitName = selectedItemUnitMap[item.id];
                    if (unitName) {
                      onAssignItem(item.id, unitName);
                      setSelectedItemUnitMap((prev) => ({
                        ...prev,
                        [item.id]: "",
                      }));
                    }
                  }}
                >
                  Assegna
                </button>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-4 border-t border-slate-600 pt-2 text-sm space-y-1">
        <p>
          Unità totali: <span className="font-semibold">{totalCount}</span>
        </p>
        <p>
          Punti totali: <span className="font-semibold">{totalPoints}</span>
        </p>
        {minUnits !== undefined && (
          <p>
            Unità minime richieste:{" "}
            <span className="font-semibold">{minUnits}</span>
          </p>
        )}
        {thresholdStep > 0 && (
          <p>
            Regola di soglia: ogni {thresholdStep} pts → ×{multiplier}
          </p>
        )}
        <p
          className={`font-semibold ${
            basicValid && dynamicValid ? "text-green-400" : "text-red-400"
          }`}
        >
          {basicValid && dynamicValid
            ? "✔ Tutti i vincoli rispettati"
            : "❌ Violazione dei vincoli"}
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
  selectedUnits.length === 0 ||
  !basicValid ||
  !dynamicValid
}
          >
            📄 Download PDF
          </button>
          <button
            onClick={onSave}
            className="py-2 w-full bg-green-600 hover:bg-green-500 text-white text-sm rounded disabled:opacity-50"
            disabled={isSaveDisabled}
          >
            {selectedArmyId ? "💾 Salva modifiche" : "💾 Salva esercito"}
          </button>
          {selectedArmyId && (
            <button
              onClick={onDelete}
              className="py-2 w-full bg-red-600 hover:bg-red-500 text-white text-sm rounded"
            >
              🗑️ Elimina esercito
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
