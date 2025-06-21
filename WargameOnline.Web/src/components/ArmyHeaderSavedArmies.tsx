import { Game, ArmySummary, Army, Mode } from "../types/types";
import { useTranslation } from "react-i18next";

type Props = {
  game: Game | null;
  savedArmies: ArmySummary[] | Army[];
  selectedArmyId: number | null;
  onSelectArmy: (id: number) => void | Promise<void>;
  mode: Mode;
};

export default function ArmyHeaderSavedArmies({
  game,
  savedArmies,
  selectedArmyId,
  onSelectArmy,
  mode,
}: Props) {
  const { t } = useTranslation();

  const visibleArmies = savedArmies.filter(
    (a) => !game || a.gameId === game.id || a.id === selectedArmyId
  );

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = Number(e.target.value);
    console.log("🧭 Dropdown selection changed to:", id);
    if (id > 0) {
      onSelectArmy(id);
    }
  };

  return (
    <div className="w-full max-w-2xl space-y-3">
      {mode !== "create" && (
        <select
          value={selectedArmyId ?? ""}
          onChange={handleChange}
          className="w-full p-2 bg-slate-800 text-white rounded mt-2"
        >
          {!selectedArmyId && (
            <option value="">{t("loadSavedList")}</option>
          )}
          {visibleArmies.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name} (ID: {a.id})
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
