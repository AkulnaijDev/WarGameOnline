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
  UnitWithCount,
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
  const [selectedUnits, setSelectedUnits] = useState<UnitWithCount[]>([]);
  const [selectedItemUnitMap, setSelectedItemUnitMap] = useState<
    Record<number, number | "">
  >({});
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

  const allGames = gameSystems;

  const units: Unit[] = faction?.units || [];

  const selectedFactionRules = faction?.constraintsByThreshold ?? {
    step: 0,
    rules: {},
  };
  const thresholdStep = selectedFactionRules.step || 0;
  const multiplier =
    thresholdStep > 0 ? Math.floor(totalPoints() / thresholdStep) + 1 : 1;

  function totalPoints() {
    return selectedUnits.reduce((sum, u) => {
      const unitPoints = (u.pointsPerUnit ?? u.points ?? 0) * u.count;
      const itemPoints =
        u.items?.reduce((s, a) => {
          const item = game?.items?.find((i) => i.id === a.itemId);
          return s + (item?.cost.amount ?? 0);
        }, 0) ?? 0;
      return sum + unitPoints + itemPoints;
    }, 0);
  }

  function totalCount() {
    return selectedUnits.reduce((sum, u) => sum + u.count, 0);
  }

  function validateBasic() {
    const constraints =
      "minUnits" in (faction?.constraintsByThreshold || {}) ||
      "maxPoints" in (faction?.constraintsByThreshold || {})
        ? (faction?.constraintsByThreshold as {
            minUnits?: number;
            maxPoints?: number;
          })
        : faction?.constraints ?? {};

    const { maxPoints, minUnits } = constraints || {};

    return (
      (!maxPoints || totalPoints() <= maxPoints) &&
      (!minUnits || totalCount() >= minUnits)
    );
  }

  function validateDynamic(): string[] {
    const violations: string[] = [];

    const selectedById = new Map<number, number>();

for (const u of selectedUnits) {
  const prev = selectedById.get(u.id) ?? 0;
  selectedById.set(u.id, prev + u.count);
}


    const allUnits: Unit[] = faction?.units || [];

    for (const unit of allUnits) {
  const constraints = unit.thresholdConstraints;
  if (!constraints) continue;

  const count = selectedById.get(unit.id) ?? 0;

  const min = constraints.min !== undefined ? constraints.min * multiplier : constraints.minFixed;
  const max = constraints.max !== undefined ? constraints.max * multiplier : constraints.maxFixed;

  if (min !== undefined && count < min) {
    violations.push(`${unit.name}: ${t("atLeastText")} ${min}`);
  }
  if (max !== undefined && count > max) {
    violations.push(`${unit.name}: ${t("atMostText")} ${max}`);
  }
}


    // 👉 Nuovo vincolo: nome esercito obbligatorio
    if (!armyName?.trim()) {
      violations.push(t("insertNameForYourList"));
    }

    return violations;
  }

  const resetState = () => {
    setGame(null);
    setFaction(null);
    setArmyName("");
    setSelectedUnits([]);
    setSelectedUnitIndex(null);
    setSelectedArmyId(null);
  };

  const groupedUnits = selectedUnits.reduce((acc, unit) => {
    if (unit.items?.length) {
      unit.items.forEach((item) => {
        acc.push({ ...unit, count: 1, itemAssigned: item.itemId });
      });
      const left = unit.count - unit.items.length;
      if (left > 0) acc.push({ ...unit, count: left });
    } else {
      acc.push(unit);
    }
    return acc;
  }, [] as (UnitWithCount & { itemAssigned?: number })[]);

  const handleLoadArmy = async (id: number) => {
    try {
      const data = await fetchArmyById(id, token);
      const selectedGame = allGames.find((g) => g.id === data.gameId) || null;
      const selectedFaction =
        selectedGame?.factions?.find((f) => f.id === data.factionId) || null;

      const enrichedUnits: UnitWithCount[] = data.units
        .map((u) => {
          const full = selectedFaction?.units.find(
            (unit) => unit.id === u.unitId
          );
          if (!full) return null;
          return { ...full, count: u.count };
        })
        .filter((x): x is UnitWithCount => x !== null);

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
  };

  const handleSaveArmy = async () => {
    if (
      !armyName ||
      !game ||
      !faction ||
      selectedUnits.length === 0 ||
      !validateBasic() ||
      validateDynamic().length > 0
    )
      return;

    const payload: ArmyInput = {
      name: armyName,
      gameId: game.id,
      factionId: faction.id,
      units: selectedUnits.map((u) => ({
        unitId: u.id,
        gameId: game.id,
        factionId: u.factionId,
        count: u.count,
      })),
    };

    try {
      const response = await saveArmy(
        { ...payload, id: selectedArmyId ?? undefined },
        token
      );
      setSelectedArmyId(response.id);
      setMode("edit");

      const updatedArmies = await fetchArmies(token);
      setSavedArmies(updatedArmies);

      toast.success(t("armySavedSuccessfully"));
    } catch (err) {
      console.error(t("errorSavingArmy"), err);
    }
  };

  const handleDeleteArmy = async () => {
    if (!selectedArmyId) return;
    try {
      await deleteArmy(selectedArmyId, token);
      setSelectedArmyId(null);
      setSelectedUnits([]);
      setArmyName("");
      setMode("start");

      const updatedArmies = await fetchArmies(token);
      setSavedArmies(updatedArmies);
      setGame(null);
      toast.success(t("armyDeletedSuccessfully"));
    } catch (err) {
      console.error(t("errorDeletingArmy"), err);
    }
  };

  const handleChangeCount = (name: string, delta: number) => {
    setSelectedUnits((prev) =>
      prev
        .map((u) => (u.name === name ? { ...u, count: u.count + delta } : u))
        .filter((u) => u.count > 0)
    );
  };

  const handleAddUnit = (u: AddableUnit) => {
    const idx = selectedUnits.findIndex((x) => x.id === u.id);

    if (idx !== -1) {
      const updated = [...selectedUnits];
      updated[idx].count += 1;
      setSelectedUnits(updated);
    } else {
      setSelectedUnits([
        ...selectedUnits,
        {
          ...u,
          count: 1,
        },
      ]);
    }
  };

  const handleExportPdf = () => {
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

  const handleAssignItem = (itemId: number, unitName: string) => {
  const item = game?.items?.find(i => i.id === itemId);
  if (!item) return;

  const rules = game?.itemsRules;
  const singleton = rules?.itemPlayabilityPerType?.itemsInSingleton;
  const perUnit = rules?.itemPlayabilityPerType?.howManyPerUnit ?? 1;

  const alreadyAssigned = selectedUnits.some(
  (u) => u.items?.some(it => it.itemId === itemId)
);
if (singleton && alreadyAssigned) {
  toast.error("Questo oggetto è singleton e già assegnato.");
  return;
}
  const unit = selectedUnits.find(u => u.name === unitName && (u.items?.length ?? 0) < u.count);
  if (!unit) {
    toast.error("Nessuna unità valida trovata per l'assegnazione.");
    return;
  }

  if ((unit.items?.length ?? 0) >= perUnit) {
    toast.error(`Questa unità può avere solo ${perUnit} oggetto(i).`);
    return;
  }

  if (item.reservedToUnitType !== "any" && unit.type !== item.reservedToUnitType) {
    toast.error(`Questo oggetto può essere assegnato solo a ${item.reservedToUnitType}`);
    return;
  }

  setSelectedUnits((prev) => {
    const idx = prev.findIndex(
      (u) => u.name === unitName && (!u.items || u.items.length < u.count)
    );
    if (idx === -1) return prev;
    const base = prev[idx];
    const updated = [...prev];
    updated[idx] = { ...base, count: base.count - 1 };
    updated.push({ ...base, count: 1, items: [{ itemId }] });
    return updated;
  });
};

const handleRemoveItemFromUnit = (itemId: number, unitIndex: number) => {
  setSelectedUnits((prev) => {
    const updated = [...prev];
    const removed = updated.splice(unitIndex, 1)[0];

    const mergeIdx = updated.findIndex(
      (u) => u.name === removed.name && (!u.items || u.items.length < u.count)
    );

    if (mergeIdx !== -1) {
      updated[mergeIdx] = {
        ...updated[mergeIdx],
        count: updated[mergeIdx].count + 1,
      };
    } else {
      updated.push({ ...removed, count: 1, items: [] });
    }

    return updated;
  });
};



  if (mode === "start") {
    return (
      <div className="min-h-screen flex flex-col sm:flex-row bg-bg text-white">
        <Sidebar />
        <main className="flex-1 p-6 flex flex-col items-center">
          <ArmyStartMenu
            canEdit={savedArmies.length > 0}
            onCreate={() => {
              resetState();
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
            onSelectArmy={handleLoadArmy}
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

        <div className="w-full max-w-6xl flex flex-col lg:flex-row gap-4 items-start lg:items-center">
          {/* Nome armata */}
          <div className="w-full lg:w-1/3">
            <ArmyNameInput armyName={armyName} setArmyName={setArmyName} />
          </div>

          {/* Selettore gioco */}
          <div className="w-full lg:w-1/3">
            <ArmyGameSelector
              game={game}
              setGame={(val) => {
                setGame(val);
                setFaction(null);
                setSelectedUnits([]);
                setSelectedArmyId(null);
              }}
              games={allGames}
            />
          </div>

          {/* Selettore fazione */}
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

        {/* Lista armate già salvate */}
        <ArmyHeaderSavedArmies
          game={game}
          faction={faction}
          savedArmies={savedArmies.filter((a) => game && a.gameId === game.id)}
          selectedArmyId={selectedArmyId}
          onSelectArmy={handleLoadArmy}
          mode={mode}
        />

        {/* Box centrale */}
        <div className="w-full flex flex-col lg:flex-row gap-6 mt-6">
          {/* Colonna sinistra: Riassunto fazione esercito */}
          <div className="w-full lg:w-3/5">
            {faction && <FactionInfoBox faction={faction} />}
          </div>

          {/* Colonna destra: Sidebar esercito */}
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
              minUnits={
                faction?.constraintsByThreshold?.step ??
                faction?.constraints?.minUnits
              }
              selectedArmyId={selectedArmyId}
              onChangeCount={handleChangeCount}
              onExport={handleExportPdf}
              onSave={handleSaveArmy}
              onDelete={handleDeleteArmy}
              isSaveDisabled={
                !armyName ||
                selectedUnits.length === 0 ||
                !validateBasic() ||
                validateDynamic().length > 0
              }
              game={game}
                onAssignItem={handleAssignItem}
  onRemoveItemFromUnit={handleRemoveItemFromUnit}
            />
          </div>
        </div>

        {/* 🔽 Riga in basso: Unità selezionabili + Dettaglio */}
        <div className="w-full flex flex-col md:flex-row gap-8 mt-6">
          {/* Colonna sinistra: UnitTable */}
          <div className="w-full md:w-3/5">
            {faction && (
              <UnitTable
                units={units}
                selectedIndex={selectedUnitIndex}
                onSelect={setSelectedUnitIndex}
                onAdd={(u) => handleAddUnit(u as AddableUnit)}
              />
            )}
          </div>

          {/* Colonna destra: Dettagli unità */}
          <div className="w-full md:w-2/5">
            {faction && (
              <UnitDetails
                unit={
                  selectedUnitIndex !== null ? units[selectedUnitIndex] : null
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
