import React, { useEffect, useState } from 'react'
import ArmyStartMenu from '../components/ArmyStartMenu'
import ArmyHeader from '../components/ArmyHeader'
import ArmySidebar from '../components/ArmySidebar'
import FactionSelector from '../components/FactionSelector'
import UnitTable from '../components/UnitTable'
import UnitDetails from '../components/UnitDetails'
import { jsPDF } from 'jspdf'
import {
  fetchArmiesByGame,
  fetchArmyById,
  saveArmy,
  deleteArmy,
} from '../api/armyApi'
import { Unit, UnitWithCount, SavedArmy } from '../types/types'

type Mode = 'start' | 'create' | 'edit'
type Faction = {
  displayName?: string
  units: Unit[]
  constraints?: { maxPoints?: number; minUnits?: number }
  constraintsByThreshold?: {
    step: number
    rules: {
      [unitName: string]: {
        min?: number
        max?: number
        minFixed?: number
        maxFixed?: number
      }
    }
  }
}

export default function ArmyCreator() {
  const [mode, setMode] = useState<Mode>('start')
  const token = localStorage.getItem('token') || ''

  const [rawData, setRawData] = useState<any>({})
  const [game, setGame] = useState('')
  const [faction, setFaction] = useState('')
  const [armyName, setArmyName] = useState('')
  const [selectedUnits, setSelectedUnits] = useState<UnitWithCount[]>([])
  const [selectedUnitIndex, setSelectedUnitIndex] = useState<number | null>(null)
  const [savedArmies, setSavedArmies] = useState<SavedArmy[]>([])
  const [selectedArmyId, setSelectedArmyId] = useState<string | null>(null)

  useEffect(() => {
    fetch('/data/games.json')
      .then(res => res.json())
      .then(setRawData)
      .catch(console.error)
  }, [])

  useEffect(() => {
    if (!token || !game) return
    fetchArmiesByGame(game, token).then(setSavedArmies).catch(console.error)
  }, [game])

  const factions: [string, Faction][] = game ? Object.entries(rawData[game] || {}) : []
  const selectedFaction: Faction | undefined = factions.find(([key]) => key === faction)?.[1]
  const units = selectedFaction?.units || []
  const currentUnit = selectedUnitIndex !== null ? units[selectedUnitIndex] : null

  const totalPoints = selectedUnits.reduce((sum, u) => sum + u.points * u.count, 0)
  const totalCount = selectedUnits.reduce((sum, u) => sum + u.count, 0)

  const thresholdStep = selectedFaction?.constraintsByThreshold?.step || 0
  const multiplier = thresholdStep > 0 ? Math.floor(totalPoints / thresholdStep) + 1 : 1
  const dynamicRules = (selectedFaction?.constraintsByThreshold?.rules || {}) as {
    [unitName: string]: {
      min?: number
      max?: number
      minFixed?: number
      maxFixed?: number
    }
  }

  const violations: string[] = []
  for (const [unitName, rule] of Object.entries(dynamicRules)) {
    const count = selectedUnits.find(u => u.name === unitName)?.count || 0
    const min = rule.min !== undefined ? rule.min * multiplier : rule.minFixed
    const max = rule.max !== undefined ? rule.max * multiplier : rule.maxFixed
    if (min !== undefined && count < min) violations.push(`${unitName}: at least ${min}`)
    if (max !== undefined && count > max) violations.push(`${unitName}: at most ${max}`)
  }

  const basicValid =
    (!selectedFaction?.constraints?.maxPoints || totalPoints <= selectedFaction.constraints.maxPoints) &&
    (!selectedFaction?.constraints?.minUnits || totalCount >= selectedFaction.constraints.minUnits)

  const dynamicValid = violations.length === 0

  const resetState = () => {
    setGame('')
    setFaction('')
    setArmyName('')
    setSelectedUnits([])
    setSelectedUnitIndex(null)
    setSelectedArmyId(null)
  }

  const handleLoadArmy = async (id: string) => {
    const data = await fetchArmyById(id, token)
    setSelectedArmyId(data.id)
    setArmyName(data.name)
    setGame(data.game)
    setFaction(data.faction)
    setSelectedUnits(data.units)
    setMode('edit')
  }

  const handleSaveArmy = async () => {
    if (!armyName || selectedUnits.length === 0 || !basicValid || !dynamicValid) return
    await saveArmy(
      { id: selectedArmyId || undefined, name: armyName, game, faction, units: selectedUnits },
      token
    )
    setSelectedArmyId(null)
    setArmyName('')
    setSelectedUnits([])
    setSavedArmies([])
    setMode('start')
  }

  const handleDeleteArmy = async () => {
    if (!selectedArmyId) return
    await deleteArmy(selectedArmyId, token)
    setSelectedArmyId(null)
    setArmyName('')
    setSelectedUnits([])
    setSavedArmies([])
    setMode('start')
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
    doc.text(`Game: ${game}`, 10, 30)
    doc.text(`Faction: ${selectedFaction?.displayName ?? faction}`, 10, 37)
    doc.text(`Points: ${totalPoints}`, 10, 44)
    doc.text(`Units: ${totalCount}`, 10, 51)
    doc.text('Units selected:', 10, 65)
    let y = 72
    selectedUnits.forEach(u => {
      doc.text(`${u.name} ×${u.count} (${u.points} pts)`, 12, y)
      y += 7
    })
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
      <ArmyStartMenu
        canEdit={savedArmies.length > 0}
        onCreate={() => {
          resetState()
          setMode('create')
        }}
        onEdit={() => setMode('edit')}
      />
    )
  }

  return (
    <div className="min-h-screen bg-bg text-white p-6 flex flex-col items-center">
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
          setFaction('')
          setSelectedUnits([])
          setSelectedArmyId(null)
        }}
        games={Object.keys(rawData)}
        savedArmies={savedArmies}
        onSelectArmy={handleLoadArmy}
      />

      <div className="w-full max-w-5xl flex flex-col md:flex-row gap-8 mt-6">
        <div className="flex-1">
          {game && (
            <FactionSelector
              faction={faction}
              setFaction={setFaction}
              factions={factions}
              clearSelection={() => {
                setSelectedUnits([])
                setSelectedUnitIndex(null)
              }}
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
              <UnitDetails unit={currentUnit} />
            </>
          )}
        </div>

        <ArmySidebar
          selectedUnits={selectedUnits}
          totalCount={totalCount}
          totalPoints={totalPoints}
          thresholdStep={thresholdStep}
          multiplier={multiplier}
          basicValid={basicValid}
          dynamicValid={dynamicValid}
          violations={violations}
          minUnits={selectedFaction?.constraints?.minUnits}
          selectedArmyId={selectedArmyId}
          onChangeCount={handleChangeCount}
          onExport={exportPdf}
          onSave={handleSaveArmy}
          onDelete={handleDeleteArmy}
          isSaveDisabled={
            !armyName || selectedUnits.length === 0 || !basicValid || !dynamicValid
          }
        />
      </div>
    </div>
  )
}
