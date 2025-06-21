import { useTranslation } from "react-i18next";
import { Army, ArmySummary, Game } from "../types/types";

type Props = {
  armyName: string;
  setArmyName: (name: string) => void;
  game: Game | null;
  setGame: (game: Game | null) => void;
  games: Game[];
  readOnly: boolean;
};

export default function ArmyHeader({
  armyName,
  setArmyName,
  game,
  setGame,
  games,
  readOnly
}: Props) {
  const { t } = useTranslation();
  return (
    <div className="w-full max-w-2xl mb-3 space-y-3">
      <input
        className="p-2 text-black rounded w-full"
        placeholder={t("nameYourArmy")}
        value={armyName}
        onChange={(e) => !readOnly && setArmyName(e.target.value)}
        readOnly={readOnly}
      />

      <select
        disabled={readOnly}
        value={game?.id ?? ""}
        onChange={(e) => {
          const selected =
            games.find((g) => g.id === Number(e.target.value)) || null;
          setGame(selected);
        }}
        className="w-full p-2 bg-slate-800 text-white rounded"
      >
        <option value="">{t("selectGame")}</option>
        {games.map((g) => (
          <option key={g.id} value={g.id}>
            {g.name}
          </option>
        ))}
      </select>
    </div>
  );
}
