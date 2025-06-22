import { useTranslation } from "react-i18next";
import { SavedArmy } from "../types/types";

type Props = {
  game: string;
  games: string[];
  savedArmies: SavedArmy[];
  onChangeGame: (game: string) => void;
  onSelectArmy: (id: string) => void;
};

export default function ArmyLoader({
  game,
  games,
  savedArmies,
  onChangeGame,
  onSelectArmy,
}: Props) {
  const { t } = useTranslation();
  return (
    <div className="w-full max-w-2xl mb-6 bg-slate-900 p-4 rounded shadow border border-slate-700">
      <h2 className="text-xl font-semibold mb-4">{t("modifyArmyList")}</h2>

      <select
        value={game}
        onChange={(e) => onChangeGame(e.target.value)}
        className="w-full mb-3 p-2 bg-slate-800 text-white rounded"
      >
        <option value="">{t("chooseWargameSystem")}</option>
        {games.map((g) => (
          <option key={g} value={g}>
            {g}
          </option>
        ))}
      </select>

      {game && savedArmies.length > 0 && (
        <select
          onChange={(e) => onSelectArmy(e.target.value)}
          defaultValue=""
          className="w-full mb-3 p-2 bg-slate-800 text-white rounded"
        >
          <option value="">{t("chooseSavedList")}</option>
          {savedArmies.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name} ({a.faction})
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
