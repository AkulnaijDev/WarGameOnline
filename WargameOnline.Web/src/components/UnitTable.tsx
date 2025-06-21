import { Unit } from "../types/types";
import { useTranslation } from "react-i18next";

type Props = {
  units: Unit[];
  selectedIndex: number | null;
  onSelect: (index: number) => void;
  onAdd: (unit: Unit) => void;
};

export default function UnitTable({
  units,
  selectedIndex,
  onSelect,
  onAdd,
}: Props) {
  const { t } = useTranslation();
  return (
    <table className="w-full text-sm text-left table-auto border border-slate-600 rounded">
      <thead className="bg-slate-700">
        <tr>
          <th className="p-2">{t("nameShort")}</th>
          <th className="p-2">{t("pointsShort")}</th>
          <th className="p-2">{t("propsShort")}</th>
          <th className="p-2">{t("addShort")}</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-600">
        {units.map((u, idx) => (
          <tr
            key={u.name}
            className={`cursor-pointer ${
              selectedIndex === idx ? "bg-slate-600" : "hover:bg-slate-700"
            }`}
            onClick={() => onSelect(idx)}
          >
            <td className="p-2">{u.name}</td>
            <td className="p-2">{u.points}</td>
            <td className="p-2">
              {Object.keys(u)
                .filter(
                  (k) => !["name", "points", "description", "count"].includes(k)
                )
                .map((k) => {
                  const val = (u as Record<string, any>)[k];
                  return `${k}: ${JSON.stringify(val)}`;
                })
                .join(", ")}
            </td>
            <td className="p-2">
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
