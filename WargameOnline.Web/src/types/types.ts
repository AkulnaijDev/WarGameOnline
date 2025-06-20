// types.ts

export type Unit = {
  name: string
  points: number
  description?: string
  rules?: string[]
  [key: string]: any
}

export type UnitWithCount = Unit & { count: number }

export type SavedArmy = {
  id: string
  name: string
  game: string
  faction: string
  units: UnitWithCount[]
}
