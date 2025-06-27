import { useEffect, useState } from "react";
import { exportPdf } from "../utils/pdf";
import Sidebar from "../components/Sidebar";
import ArmyStartMenu from "../components/ArmyStartMenu";
import ArmyNameInput from "../components/ArmyNameInput";
import ArmyGameSelector from "../components/ArmyGameSelector";
import ArmyHeaderSavedArmies from "../components/ArmyHeaderSavedArmies";
import ArmySidebar from "../components/ArmySidebar";
import FactionSelector from "../components/FactionSelector";
import FactionInfoBox from "../components/FactionInfoBox";
import UnitTable from "../components/UnitTable";
import UnitDetails from "../components/UnitDetails";
import {
  fetchArmies,
  fetchArmyById,
  saveArmy,
  deleteArmy,
} from "../api/armyApi";
import { useAuth } from "../context/AuthContext";
import {
  Faction,
  Unit,
  UnitWithItem,
  ArmyInput,
  ArmySummary,
  Mode,
  AddableUnit,
  GameSystem,
  GenericGameRule,
} from "../types/types";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";

export default function ArmyCreator() {
  const [rawData, setRawData] = useState<any[]>([]);
  const [gameSystems, setGameSystems] = useState<GameSystem[]>([]);
  const [genericGameRules, setGenericGameRules] = useState<GenericGameRule[]>(
    []
  );
  const [game, setGame] = useState<GameSystem | null>(null);
  const [mode, setMode] = useState<Mode>("start");
  const [faction, setFaction] = useState<Faction | null>(null);
  const [armyName, setArmyName] = useState("");
  const [selectedUnits, setSelectedUnits] = useState<UnitWithItem[]>([]);
  const [selectedUnitIndex, setSelectedUnitIndex] = useState<number | null>(
    null
  );
  const [savedArmies, setSavedArmies] = useState<ArmySummary[]>([]);
  const [selectedArmyId, setSelectedArmyId] = useState<number | null>(null);
  const { t } = useTranslation();
  const { token } = useAuth();

  useEffect(() => {
    fetch("/data/games.json")
      .then((res) => res.json())
      .then((data) => {
        setRawData(data);
        const gameSystemsEntry = data.find(
          (el: any) => typeof el === "object" && "gameSystems" in el
        );
        const genericRulesEntry = data.find(
          (el: any) => typeof el === "object" && "genericGameRules" in el
        );
        setGameSystems(gameSystemsEntry?.gameSystems || []);
        setGenericGameRules(genericRulesEntry?.genericGameRules || []);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!token) return;
    fetchArmies(token).then(setSavedArmies).catch(console.error);
  }, [token]);

  const totalPoints = () =>
    selectedUnits.reduce((sum, u) => {
      const base = u.pointsPerUnit ?? 0;
      const items =
        u.items?.reduce((acc, a) => {
          const item = game?.items?.find((i) => i.id === a.itemId);
          return acc + (item?.cost.amount ?? 0);
        }, 0) ?? 0;
      return sum + base + items;
    }, 0);

  const totalCount = () => selectedUnits.length;

  const units = faction?.units ?? [];
  const thresholdStep = faction?.constraintsByThreshold?.step ?? 0;
  const multiplier =
    thresholdStep > 0 ? Math.floor(totalPoints() / thresholdStep) + 1 : 1;

  const validateBasic = () => {
    const minUnits = faction?.constraints?.minUnits ?? 0;
    const maxPoints = faction?.constraints?.maxPoints ?? Infinity;
    return selectedUnits.length >= minUnits && totalPoints() <= maxPoints;
  };

  const validateDynamic = (): string[] => {
    const violations: string[] = [];
    const countByUnitId = selectedUnits.reduce((acc, u) => {
      acc[u.id] = (acc[u.id] ?? 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    for (const unit of faction?.units ?? []) {
      const count = countByUnitId[unit.id] ?? 0;
      const min =
        unit.thresholdConstraints?.min !== undefined
          ? unit.thresholdConstraints.min * multiplier
          : unit.thresholdConstraints?.minFixed;

      const max =
        unit.thresholdConstraints?.max !== undefined
          ? unit.thresholdConstraints.max * multiplier
          : unit.thresholdConstraints?.maxFixed;

      if (min !== undefined && count < min)
        violations.push(`${unit.name}: almeno ${min}`);
      if (max !== undefined && count > max)
        violations.push(`${unit.name}: massimo ${max}`);
    }

    if (!armyName.trim()) {
      violations.push("Inserire un nome per la lista");
    }

    return violations;
  };

  const handleAddUnit = (unit: AddableUnit | UnitWithItem) => {
    const newUnit: UnitWithItem = {
      ...unit,
      factionId: faction?.id ?? 0,
      items: [],
    };
    setSelectedUnits((prev) => [...prev, newUnit]);
  };

  const handleRemoveSpecificUnit = (index: number) => {
    setSelectedUnits((prev) => prev.filter((_, i) => i !== index));
  };

  const onRemoveUnitsByName = (unitName: string) => {
    setSelectedUnits((prev) =>
      prev.filter(
        (u) => !(u.name === unitName && (!u.items || u.items.length === 0))
      )
    );
  };

  const handleAssignItem = (itemId: number, unitName: string) => {
    const item = game?.items?.find((i) => i.id === itemId);
    if (!item) return;

    const isSingleton =
      game?.itemsRule?.itemPlayability?.itemsInSingleton ?? false;
    const howManyPerUnit =
      game?.itemsRule?.itemPlayability?.howManyPerUnit ?? 1;

    const alreadyAssigned = selectedUnits.some((u) =>
      u.items?.some((i) => i.itemId === itemId)
    );

    if (isSingleton && alreadyAssigned) {
      toast.error("Oggetto singleton già assegnato.");
      return;
    }

    const index = selectedUnits.findIndex(
      (u) =>
        u.name === unitName &&
        (u.items?.length ?? 0) < howManyPerUnit &&
        (item.reservedToUnitType === "any" ||
          u.type === item.reservedToUnitType)
    );

    if (index === -1) {
      toast.error("Nessuna unità compatibile trovata.");
      return;
    }

    setSelectedUnits((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        items: [...(updated[index].items ?? []), { itemId }],
      };
      return updated;
    });
  };

  const handleRemoveItemFromUnit = (itemId: number, unitIndex: number) => {
    setSelectedUnits((prev) => {
      const updated = [...prev];
      const unit = updated[unitIndex];
      if (!unit) return prev;
      updated[unitIndex] = {
        ...unit,
        items: unit.items?.filter((i) => i.itemId !== itemId) ?? [],
      };
      return updated;
    });
  };

  const handleSave = async () => {
    if (!faction || !game || selectedUnits.length === 0) return;

    const payload: ArmyInput = {
      name: armyName,
      gameId: game.id,
      factionId: faction.id,
      units: selectedUnits.map((u) => ({
        unitId: u.id,
        gameId: game.id,
        factionId: u.factionId,
        count: 1,
      })),
    };

    try {
      const result = await saveArmy(
        { ...payload, id: selectedArmyId ?? undefined },
        token
      );
      setSelectedArmyId(result.id);
      const updated = await fetchArmies(token);
      setSavedArmies(updated);
      toast.success("Esercito salvato.");
    } catch (err) {
      toast.error("Errore durante il salvataggio.");
    }
  };

  const handleDelete = async () => {
    if (!selectedArmyId) return;
    try {
      await deleteArmy(selectedArmyId, token);
      setSelectedArmyId(null);
      setSelectedUnits([]);
      setArmyName("");
      setMode("start");
      const updated = await fetchArmies(token);
      setSavedArmies(updated);
      toast.success("Esercito eliminato.");
    } catch (err) {
      toast.error("Errore durante l'eliminazione.");
    }
  };

  const handleExport = () => {
    exportPdf(
      t,
      armyName,
      game,
      faction,
      selectedUnits,
      totalPoints(),
      totalCount(),
      validateDynamic
    );
  };

  if (mode === "start") {
    return (
      <div className="min-h-screen flex flex-col sm:flex-row bg-bg text-white">
        <Sidebar />
        <main className="flex-1 p-6 flex flex-col items-center">
          <ArmyStartMenu
            canEdit={savedArmies.length > 0}
            onCreate={() => {
              setArmyName("");
              setFaction(null);
              setGame(null);
              setSelectedUnits([]);
              setSelectedArmyId(null);
              setSelectedUnitIndex(null);
              setMode("create");
            }}
            onEdit={() => setMode("edit")}
          />
        </main>
      </div>
    );
  }

  if (mode === "edit" && !selectedArmyId) {
    return (
      <div className="min-h-screen flex flex-col sm:flex-row bg-bg text-white">
        <Sidebar />
        <main className="flex-1 p-6 flex flex-col items-center">
          <button
            onClick={() => {
              setMode("start");
              setSelectedArmyId(null);
              setGame(null);
            }}
            className="self-start mb-4 text-sm text-slate-400 hover:underline"
          >
            {t("backToMenu")}
          </button>

          <ArmyHeaderSavedArmies
            game={game}
            faction={faction}
            savedArmies={savedArmies}
            selectedArmyId={selectedArmyId}
            onSelectArmy={async (id) => {
              try {
                const data = await fetchArmyById(id, token);
                const selectedGame =
                  gameSystems.find((g) => g.id === data.gameId) || null;
                const selectedFaction =
                  selectedGame?.factions?.find(
                    (f) => f.id === data.factionId
                  ) || null;

                const enrichedUnits = data.units.reduce<UnitWithItem[]>(
                  (acc, u) => {
                    const base = selectedFaction?.units.find(
                      (unit) => unit.id === u.unitId
                    );
                    if (base)
                      acc.push({
                        ...base,
                        factionId: data.factionId,
                        items: [],
                      });
                    return acc;
                  },
                  []
                );

                if (!selectedGame || !selectedFaction)
                  throw new Error(t("gameOrFactionNotFound"));

                setSelectedArmyId(data.id);
                setArmyName(data.name);
                setGame(selectedGame);
                setFaction(selectedFaction);
                setSelectedUnits(enrichedUnits);
                setMode("edit");
              } catch (err) {
                console.error(t("errorLoadingArmyList"), err);
              }
            }}
            mode={mode}
          />

          <div className="bg-yellow-700 text-white p-4 rounded mt-6 max-w-xl">
            {t("noSelectedListAlert")}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col sm:flex-row bg-bg text-white">
      <Sidebar />
      <main className="flex-1 p-6 flex flex-col items-center">
        <button
          onClick={() => {
            setMode("start");
            setSelectedArmyId(null);
            setGame(null);
          }}
          className="self-start mb-4 text-sm text-slate-400 hover:underline"
        >
          {t("backToMenu")}
        </button>

        {/* Riga superiore: input nome, gameSystem e fazione */}
        <div className="w-full max-w-6xl flex flex-col lg:flex-row gap-4 items-start lg:items-center">
          <div className="w-full lg:w-1/3">
            <ArmyNameInput armyName={armyName} setArmyName={setArmyName} />
          </div>

          <div className="w-full lg:w-1/3">
            <ArmyGameSelector
              game={game}
              setGame={(val) => {
                setGame(val);
                setFaction(null);
                setSelectedUnits([]);
                setSelectedArmyId(null);
              }}
              games={gameSystems}
            />
          </div>

          {game && (
            <div className="w-full lg:w-1/3">
              <FactionSelector
                faction={faction}
                setFaction={(val) => {
                  setFaction(val);
                  setSelectedUnits([]);
                  setSelectedUnitIndex(null);
                }}
                factions={game.factions || []}
              />
            </div>
          )}
        </div>

        {/* Lista eserciti salvati */}
        <ArmyHeaderSavedArmies
          game={game}
          faction={faction}
          savedArmies={savedArmies.filter((a) => game && a.gameId === game.id)}
          selectedArmyId={selectedArmyId}
          onSelectArmy={async (id) => {
            try {
              const data = await fetchArmyById(id, token);
              const selectedGame =
                gameSystems.find((g) => g.id === data.gameId) || null;
              const selectedFaction =
                selectedGame?.factions?.find((f) => f.id === data.factionId) ||
                null;

              const enrichedUnits = data.units.reduce<UnitWithItem[]>(
                (acc, u) => {
                  const base = selectedFaction?.units.find(
                    (unit) => unit.id === u.unitId
                  );
                  if (base)
                    acc.push({ ...base, factionId: data.factionId, items: [] });
                  return acc;
                },
                []
              );

              if (!selectedGame || !selectedFaction)
                throw new Error(t("gameOrFactionNotFound"));

              setSelectedArmyId(data.id);
              setArmyName(data.name);
              setGame(selectedGame);
              setFaction(selectedFaction);
              setSelectedUnits(enrichedUnits);
              setMode("edit");
            } catch (err) {
              console.error(t("errorLoadingArmyList"), err);
            }
          }}
          mode={mode}
        />

        {/* Box centrale */}
        <div className="w-full flex flex-col lg:flex-row gap-6 mt-6">
          {/* Colonna sinistra: Info fazione */}
          <div className="w-full lg:w-3/5">
            {faction && <FactionInfoBox faction={faction} />}
          </div>

          {/* Colonna destra: ArmySidebar */}
          <div className="w-full lg:w-2/5 h-full flex items-start lg:items-center justify-center">
            <ArmySidebar
              selectedUnits={selectedUnits}
              totalCount={totalCount()}
              totalPoints={totalPoints()}
              thresholdStep={thresholdStep}
              multiplier={multiplier}
              basicValid={validateBasic()}
              dynamicValid={validateDynamic().length === 0}
              violations={validateDynamic()}
              minUnits={faction?.constraints?.minUnits}
              selectedArmyId={selectedArmyId}
              isSaveDisabled={
                !armyName ||
                selectedUnits.length === 0 ||
                !validateBasic() ||
                validateDynamic().length > 0
              }
              game={game}
              onExport={handleExport}
              onSave={handleSave}
              onDelete={handleDelete}
              onAssignItem={handleAssignItem}
              onRemoveItemFromUnit={handleRemoveItemFromUnit}
              onRemoveSpecificUnit={handleRemoveSpecificUnit}
              onAddUnit={handleAddUnit}
              onRemoveUnitsByName={onRemoveUnitsByName}
            />
          </div>
        </div>

        {/* Riga inferiore: tabella unità + dettagli unità */}
        <div className="w-full flex flex-col md:flex-row gap-8 mt-6">
          {/* Tabella unità */}
          <div className="w-full md:w-3/5">
            {faction && (
              <UnitTable
                units={faction.units}
                selectedIndex={selectedUnitIndex}
                onSelect={setSelectedUnitIndex}
                onAdd={(u) => handleAddUnit({ ...u, factionId: faction.id })}
              />
            )}
          </div>

          {/* Dettagli unità */}
          <div className="w-full md:w-2/5">
            {faction && (
              <UnitDetails
                unit={
                  selectedUnitIndex !== null
                    ? faction.units[selectedUnitIndex]
                    : null
                }
                faction={faction}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
