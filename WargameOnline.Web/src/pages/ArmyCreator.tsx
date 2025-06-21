import { useEffect, useState } from "react";
import { jsPDF } from "jspdf";
import Sidebar from "../components/Sidebar";
import ArmyStartMenu from "../components/ArmyStartMenu";
import ArmyHeader from "../components/ArmyHeader";
import ArmyHeaderSavedArmies from "../components/ArmyHeaderSavedArmies";
import ArmySidebar from "../components/ArmySidebar";
import FactionSelector from "../components/FactionSelector";
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
  Game,
  Faction,
  Unit,
  UnitWithCount,
  ArmyInput,
  ArmySummary,
  Mode,
  AddableUnit,
} from "../types/types";
import { useTranslation } from "react-i18next";

export default function ArmyCreator() {
  const [mode, setMode] = useState<Mode>("start");
  const [rawData, setRawData] = useState<any>({});
  const [game, setGame] = useState<Game | null>(null);
  const [faction, setFaction] = useState<Faction | null>(null);
  const [armyName, setArmyName] = useState("");
  const [selectedUnits, setSelectedUnits] = useState<UnitWithCount[]>([]);
  const [selectedUnitIndex, setSelectedUnitIndex] = useState<number | null>(
    null
  );
  const [savedArmies, setSavedArmies] = useState<ArmySummary[]>([]);
  const [selectedArmyId, setSelectedArmyId] = useState<number | null>(null);

  const { token } = useAuth();
  const { t } = useTranslation();
  useEffect(() => {
    fetch("/data/games.json")
      .then((res) => res.json())
      .then(setRawData)
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!token) return;
    fetchArmies(token).then(setSavedArmies).catch(console.error);
  }, [token]);

  const allGames: Game[] = Object.values(rawData) as Game[];
  const units: Unit[] = faction?.units || [];

  const selectedFactionRules = faction?.constraintsByThreshold ?? {
    step: 0,
    rules: {},
  };
  const thresholdStep = selectedFactionRules.step || 0;
  const multiplier =
    thresholdStep > 0 ? Math.floor(totalPoints() / thresholdStep) + 1 : 1;

  function totalPoints() {
    return selectedUnits.reduce((sum, u) => sum + u.points * u.count, 0);
  }

  function totalCount() {
    return selectedUnits.reduce((sum, u) => sum + u.count, 0);
  }

  function validateBasic() {
    const c = faction?.constraints;
    return (
      (!c?.maxPoints || totalPoints() <= c.maxPoints) &&
      (!c?.minUnits || totalCount() >= c.minUnits)
    );
  }

  function validateDynamic(): string[] {
    const violations: string[] = [];

    const selectedById = new Map<number, UnitWithCount>();
    for (const u of selectedUnits) {
      selectedById.set(u.id, u);
    }

    const allUnits: Unit[] = faction?.units || [];

    for (const unit of allUnits) {
      const constraints = unit.thresholdConstraints;
      if (!constraints) continue;

      const selected = selectedById.get(unit.id);
      const count = selected?.count ?? 0;

      const min =
        constraints.min !== undefined
          ? constraints.min * multiplier
          : constraints.minFixed;
      const max =
        constraints.max !== undefined
          ? constraints.max * multiplier
          : constraints.maxFixed;

      if (min !== undefined && count < min) {
        violations.push(`${unit.name}: ${t("atLeastText")}${min}`);
      }
      if (max !== undefined && count > max) {
        violations.push(`${unit.name}: ${t("atMostText")}${max}`);
      }
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
          factionId: u.factionId,
        },
      ]);
    }
  };

  const exportPdf = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`${t("pdfArmy")} ${armyName || t("pdfUnnamed")}`, 10, 20);
    doc.setFontSize(12);
    doc.text(`${t("pdfGame")} ${game?.name || "-"}`, 10, 30);
    doc.text(`${t("pdfFaction")}: ${faction?.name || "-"}`, 10, 37);
    doc.text(`${t("pdfPoints")}: ${totalPoints()}`, 10, 44);
    doc.text(`${t("pdfUnits")}: ${totalCount()}`, 10, 51);
    doc.text(`${t("pdfUnitsSelected")}`, 10, 65);
    let y = 72;
    selectedUnits.forEach((u) => {
      doc.text(
        `${u.name} ×${u.count} (${u.points} ${t("pointsShortMinus")})`,
        12,
        y
      );
      y += 7;
    });
    const violations = validateDynamic();
    if (violations.length > 0) {
      y += 5;
      doc.setTextColor(200, 0, 0);
      doc.text(t("pdfViolation"), 10, y);
      y += 6;
      violations.forEach((v) => {
        doc.text(`• ${v}`, 12, y);
        y += 6;
      });
      doc.setTextColor(0, 0, 0);
    }
    doc.save(`${armyName || "army-list"}.pdf`);
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
            onClick={() => setMode("start")}
            className="self-start mb-4 text-sm text-slate-400 hover:underline"
          >
            {t("backToMenu")}
          </button>

          <ArmyHeaderSavedArmies
            game={game}
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
          onClick={() => setMode("start")}
          className="self-start mb-4 text-sm text-slate-400 hover:underline"
        >
          {t("backToMenu")}
        </button>

        <ArmyHeader
          armyName={armyName}
          setArmyName={setArmyName}
          game={game}
          setGame={(val) => {
            setGame(val);
            setFaction(null);
            setSelectedUnits([]);
            setSelectedArmyId(null);
          }}
          games={allGames}
          savedArmies={
            mode !== "create"
              ? savedArmies.filter((a) => game && a.gameId === game.id)
              : []
          }
          onSelectArmy={handleLoadArmy}
        />

        {game && (
          <FactionSelector
            faction={faction}
            setFaction={(val) => {
              setFaction(val);
              setSelectedUnits([]);
              setSelectedUnitIndex(null);
            }}
            factions={game.factions || []}
          />
        )}

        <ArmyHeaderSavedArmies
          game={game}
          savedArmies={savedArmies.filter((a) => game && a.gameId === game.id)}
          selectedArmyId={selectedArmyId}
          onSelectArmy={handleLoadArmy}
          mode={mode}
        />

        <div className="w-full max-w-5xl flex flex-col md:flex-row gap-8 mt-6">
          <div className="flex-1">
            {faction && (
              <>
                <UnitTable
                  units={units}
                  selectedIndex={selectedUnitIndex}
                  onSelect={setSelectedUnitIndex}
                  onAdd={(u) => handleAddUnit(u as AddableUnit)}
                />
                <UnitDetails
                  unit={
                    selectedUnitIndex !== null ? units[selectedUnitIndex] : null
                  }
                />
              </>
            )}
          </div>

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
            onChangeCount={handleChangeCount}
            onExport={exportPdf}
            onSave={handleSaveArmy}
            onDelete={handleDeleteArmy}
            isSaveDisabled={
              !armyName ||
              selectedUnits.length === 0 ||
              !validateBasic() ||
              validateDynamic().length > 0
            }
          />
        </div>
      </main>
    </div>
  );
}
