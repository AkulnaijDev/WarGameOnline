export type SavedArmy = {
  id: string
  name: string
  game: string
  faction: string
  units: UnitWithCount[]
}

export type Game = {
  id: number
  name: string
  factions: Faction[]
}

export type Faction = {
  id: number
  name: string
  displayName?: string
  units: Unit[]
  constraints?: {
    maxPoints?: number
    minUnits?: number
  }
  constraintsByThreshold?: {
    step: number
  }

  // Aggiunto dinamicamente via enrichGameData()
  gameId?: number
}

export type ThresholdConstraints = {
  min?: number
  max?: number
  minFixed?: number
  maxFixed?: number
}

export type Unit = {
  id: number
  name: string
  points: number
  stats?: Record<string, number>
  description?: string
  rules?: string[]
  thresholdConstraints?: ThresholdConstraints

  // Aggiunto dinamicamente via enrichGameData()
  factionId?: number
  gameId?: number
}

export type UnitWithCount = Unit & {
  count: number
  factionId: number
}

export type AddableUnit = Unit & { factionId: number }

export type ArmyInputWithId = ArmyInput & { id?: number }

export type Mode = 'start' | 'create' | 'edit'

export type ArmyInput = {
  name: string
  gameId: number
  factionId: number
  units: Array<{
    unitId: number
    gameId: number
    factionId: number
    count: number
  }>
}

export type ArmySummary = {
  id: number
  name: string
  gameId: number
  factionId: number
}

export type Army = ArmySummary & {
  units: ArmyInput['units']
}
