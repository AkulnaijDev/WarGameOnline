import { Unit } from "../types/types";
import { useTranslation } from "react-i18next";

type Props = {
  units: Unit[];
  selectedIndex: number | null;
  onSelect: (index: number) => void;
  onAdd: (unit: Unit) => void;
};

const specialTypes = [
  "Wizard",
  "Hero",
  "General",
  "MonstrousMount",
  "ChariotMount",
];

export default function UnitTable({
  units,
  selectedIndex,
  onSelect,
  onAdd,
}: Props) {
  const { t } = useTranslation();

  const renderAttacks = (u: Unit) => {
    if (!u.attacks || u.attacks.length === 0) {
      return specialTypes.includes(u.type) ? "+0" : "-";
    }

    const artilleryVals: string[] = [];
    let output: string[] = [];

    u.attacks.forEach((a) => {
      for (const [k, v] of Object.entries(a)) {
        const key = k.toLowerCase();

        if (key.includes("rangeartillery")) {
          artilleryVals.push(String(v));
        } else if (key.includes("artillery")) {
          output.push(String(v));
        } else if (key === "bonus") {
          output.push(`+${v}`);
        } else if (["skewer", "bounce"].includes(key)) {
          output.push(`+${v} ${key}`);
        } else if (["melee", "ranged"].includes(key)) {
          output.push(String(v));
        }
      }
    });

    if (artilleryVals.length) {
      const artilleryStr = output.length ? output[0] : "";
      return `${artilleryStr}/${artilleryVals.join("-")}`;
    }

    return output.join("/");
  };

  const formatStat = (val?: number, allowZero = false) =>
    val === 0 && !allowZero ? "-" : val ?? "-";

  const formatMinMax = (u: Unit) => {
    const min = u.thresholdConstraints?.minFixed ?? u.thresholdConstraints?.min;
    const max = u.thresholdConstraints?.maxFixed ?? u.thresholdConstraints?.max;
    if (min !== undefined && max !== undefined && min === max) return `${min}`;
    if (min !== undefined || max !== undefined)
      return `${min ?? "-"}/${max ?? "-"}`;
    return "-";
  };

  return (
    <table className="w-full text-xs table-auto border border-slate-600 rounded text-left">
      <thead className="bg-slate-700 text-slate-100">
        <tr>
          <th className="p-1">{t("nameShort")}</th>
          <th className="p-1">{t("type")}</th>
          <th className="p-1">{t("attacks")}</th>
          <th className="p-1">{t("hits")}</th>
          <th className="p-1">{t("armour")}</th>
          <th className="p-1">{t("command")}</th>
          <th className="p-1">{t("unitSize")}</th>
          <th className="p-1">{t("pointsPerUnit")}</th>
          <th className="p-1">{t("minMax")}</th>
          <th className="p-1">{t("unitRules")}</th>
          <th className="p-1">{t("addShort")}</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-600 text-slate-200">
        {units.map((u, idx) => (
          <tr
            key={u.id}
            className={`cursor-pointer ${
              selectedIndex === idx ? "bg-slate-600" : "hover:bg-slate-700"
            }`}
            onClick={() => onSelect(idx)}
          >
            <td className="p-1">{u.name}</td>
            <td className="p-1">{u.type}</td>
            <td className="p-1">{renderAttacks(u)}</td>
            <td className="p-1">{formatStat(u.hits)}</td>
            <td className="p-1">
              {specialTypes.includes(u.type)
                ? "-"
                : u.armour === 0
                ? "0"
                : u.armour !== undefined
                ? `${u.armour}+`
                : "0"}
            </td>
            <td className="p-1">{formatStat(u.command)}</td>
            <td className="p-1">
              {u.unitSize === 0 ? "-" : u.unitSize ?? "-"}
            </td>
            <td className="p-1">{u.pointsPerUnit ?? "-"}</td>
            <td className="p-1">{formatMinMax(u)}</td>
            <td className="p-1">{u.rules?.length ? "*special" : "-"}</td>
            <td className="p-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAdd(u);
                }}
                className="text-green-400 hover:text-green-300"
              >
                ➕
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
