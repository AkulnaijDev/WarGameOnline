import { Game } from "../types/types";
import { useTranslation } from "react-i18next";

type Props = {
  game: Game | null;
  setGame: (game: Game | null) => void;
  games: Game[];
};

export default function ArmyGameSelector({ game, setGame, games }: Props) {
  const { t } = useTranslation();
  return (
    <select
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
  );
}
