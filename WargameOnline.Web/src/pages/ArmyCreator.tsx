import { useEffect, useState } from 'react'
import { jsPDF } from 'jspdf'
import Sidebar from '../components/Sidebar'
import ArmyStartMenu from '../components/ArmyStartMenu'
import ArmyHeader from '../components/ArmyHeader'
import ArmySidebar from '../components/ArmySidebar'
import FactionSelector from '../components/FactionSelector'
import UnitTable from '../components/UnitTable'
import UnitDetails from '../components/UnitDetails'
import {
  fetchArmies,
  fetchArmyById,
  saveArmy,
  deleteArmy
} from '../api/armyApi'
import { useAuth } from '../context/AuthContext'
import { Game, Faction, Unit, UnitWithCount, ArmyInput, ArmySummary } from '../types/types'

type Mode = 'start' | 'create' | 'edit'

export default function ArmyCreator() {
  const [mode, setMode] = useState<Mode>('start')
  const [rawData, setRawData] = useState<any>({})
  const [game, setGame] = useState<Game | null>(null)
  const [faction, setFaction] = useState<Faction | null>(null)
  const [armyName, setArmyName] = useState('')
  const [selectedUnits, setSelectedUnits] = useState<UnitWithCount[]>([])
  const [selectedUnitIndex, setSelectedUnitIndex] = useState<number | null>(null)
  const [savedArmies, setSavedArmies] = useState<ArmySummary[]>([])
  const [selectedArmyId, setSelectedArmyId] = useState<number | null>(null)

  const { token } = useAuth()

  useEffect(() => {
    fetch('/data/games.json')
      .then(res => res.json())
      .then(setRawData)
      .catch(console.error)
  }, [])

  useEffect(() => {
    if (!token || !game) return
    fetchArmies(token).then(setSavedArmies).catch(console.error)
  }, [game])

  const allGames: Game[] = Object.values(rawData) as Game[]
  const units: Unit[] = faction?.units || []

  const selectedFactionRules = faction?.constraintsByThreshold ?? {
    step: 0,
    rules: {}
  }
  const thresholdStep = selectedFactionRules.step || 0
  const multiplier = thresholdStep > 0 ? Math.floor(totalPoints() / thresholdStep) + 1 : 1

  function totalPoints() {
    return selectedUnits.reduce((sum, u) => sum + u.points * u.count, 0)
  }

  function totalCount() {
    return selectedUnits.reduce((sum, u) => sum + u.count, 0)
  }

  function validateBasic() {
    const c = faction?.constraints
    return (!c?.maxPoints || totalPoints() <= c.maxPoints) &&
      (!c?.minUnits || totalCount() >= c.minUnits)
  }

  function validateDynamic(): string[] {
    const rules = selectedFactionRules.rules || {}
    for (const [unitName, rule] of Object.entries(rules) as [
      string,
      { min?: number; max?: number; minFixed?: number; maxFixed?: number }
    ][]) {
      // ora TypeScript conosce il tipo di rule ✅
    }
    const violations: string[] = []
    for (const [unitName, rule] of Object.entries(rules)) {
      const found = selectedUnits.find(u => u.name === unitName)
      const count = found?.count ?? 0
      const min = rule.min !== undefined ? rule.min * multiplier : rule.minFixed
      const max = rule.max !== undefined ? rule.max * multiplier : rule.maxFixed
      if (min !== undefined && count < min) violations.push(`${unitName}: at least ${min}`)
      if (max !== undefined && count > max) violations.push(`${unitName}: at most ${max}`)
    }
    return violations
  }

  const resetState = () => {
    setGame(null)
    setFaction(null)
    setArmyName('')
    setSelectedUnits([])
    setSelectedUnitIndex(null)
    setSelectedArmyId(null)
  }

  const handleLoadArmy = async (id: number) => {
    try {
      const data = await fetchArmyById(id, token)
      const selectedGame = allGames.find(g => g.id === data.gameId) || null
      const selectedFaction = selectedGame?.factions?.find(f => f.id === data.factionId) || null

      const enrichedUnits: UnitWithCount[] = data.units
        .map(u => {
          const full = faction?.units.find(unit => unit.id === u.unitId)
          if (!full) return null
          return { ...full, count: u.count }
        })
        .filter((x): x is UnitWithCount => x !== null)

      if (!selectedGame || !selectedFaction) throw new Error('Game or Faction not found')

      setSelectedArmyId(data.id)
      setArmyName(data.name)
      setGame(selectedGame)
      setFaction(selectedFaction)
      setSelectedUnits(enrichedUnits)
      setMode('edit')
    } catch (err) {
      console.error('Errore nel caricamento armata:', err)
    }
  }

  const handleSaveArmy = async () => {
    if (!armyName || !game || !faction || selectedUnits.length === 0 || !validateBasic() || validateDynamic().length > 0) return

    const payload: ArmyInput = {
      name: armyName,
      gameId: game.id,
      factionId: faction.id,
      units: selectedUnits.map(u => ({
        unitId: u.id,
        gameId: game.id,
        factionId: faction.id,
        count: u.count
      }))
    }

    try {
      await saveArmy(
        { ...(payload as any), id: selectedArmyId ?? undefined },
        token
      )
      resetState()
      setMode('start')
    } catch (err) {
      console.error('Errore salvataggio armata:', err)
    }
  }

  const handleDeleteArmy = async () => {
    if (!selectedArmyId) return
    try {
      await deleteArmy(selectedArmyId, token)
      resetState()
      setMode('start')
    } catch (err) {
      console.error('Errore eliminazione armata:', err)
    }
  }

  const handleChangeCount = (name: string, delta: number) => {
    setSelectedUnits(prev =>
      prev
        .map(u => (u.name === name ? { ...u, count: u.count + delta } : u))
        .filter(u => u.count > 0)
    )
  }

  const handleAddUnit = (u: Unit) => {
    const idx = selectedUnits.findIndex(x => x.name === u.name)
    if (idx !== -1) {
      const updated = [...selectedUnits]
      updated[idx].count += 1
      setSelectedUnits(updated)
    } else {
      setSelectedUnits([...selectedUnits, { ...u, count: 1 }])
    }
  }

  const exportPdf = () => {
    const doc = new jsPDF()
    doc.setFontSize(16)
    doc.text(`Army: ${armyName || 'Unnamed'}`, 10, 20)
    doc.setFontSize(12)
    doc.text(`Game: ${game?.name || '-'}`, 10, 30)
    doc.text(`Faction: ${faction?.name || '-'}`, 10, 37)
    doc.text(`Points: ${totalPoints()}`, 10, 44)
    doc.text(`Units: ${totalCount()}`, 10, 51)
    doc.text('Units selected:', 10, 65)
    let y = 72
    selectedUnits.forEach(u => {
      doc.text(`${u.name} ×${u.count} (${u.points} pts)`, 12, y)
      y += 7
    })
    const violations = validateDynamic()
    if (violations.length > 0) {
      y += 5
      doc.setTextColor(200, 0, 0)
      doc.text('⚠ Violations:', 10, y)
      y += 6
      violations.forEach(v => {
        doc.text(`• ${v}`, 12, y)
        y += 6
      })
      doc.setTextColor(0, 0, 0)
    }
    doc.save(`${armyName || 'army-list'}.pdf`)
  }

  if (mode === 'start') {
    return (
      <div className="min-h-screen flex flex-col sm:flex-row bg-bg text-white">
        <Sidebar />
        <main className="flex-1 p-6 flex flex-col items-center">
          <ArmyStartMenu
            canEdit={savedArmies.length > 0}
            onCreate={() => {
              resetState()
              setMode('create')
            }}
            onEdit={() => setMode('edit')}
          />
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col sm:flex-row bg-bg text-white">
      <Sidebar />

      <main className="flex-1 p-6 flex flex-col items-center">
        <button
          onClick={() => setMode('start')}
          className="self-start mb-4 text-sm text-slate-400 hover:underline"
        >
          ← Torna al menu
        </button>

        <ArmyHeader
          armyName={armyName}
          setArmyName={setArmyName}
          game={game}
          setGame={(val) => {
            setGame(val)
            setFaction(null)
            setSelectedUnits([])
            setSelectedArmyId(null)
          }}
          games={allGames}
          savedArmies={savedArmies}
          onSelectArmy={handleLoadArmy}
        />

        <div className="w-full max-w-5xl flex flex-col md:flex-row gap-8 mt-6">
          <div className="flex-1">
            {game && (
              <FactionSelector
                faction={faction}
                setFaction={(val) => {
                  setFaction(val)
                  setSelectedUnits([])
                  setSelectedUnitIndex(null)
                }}
                factions={game.factions || []}
              />
            )}

            {faction && (
              <>
                <UnitTable
                  units={units}
                  selectedIndex={selectedUnitIndex}
                  onSelect={setSelectedUnitIndex}
                  onAdd={handleAddUnit}
                />
                <UnitDetails unit={selectedUnitIndex !== null ? units[selectedUnitIndex] : null} />
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
              !armyName || selectedUnits.length === 0 || !validateBasic() || validateDynamic().length > 0
            }
          />
        </div>
      </main>
    </div>
  )
}
