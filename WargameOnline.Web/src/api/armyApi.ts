// src/api/armyApi.ts

import { SavedArmy } from '../types/types'

const BASE_URL = '/api/armies'

export const fetchArmiesByGame = async (game: string, token: string) => {
  const res = await fetch(`${BASE_URL}?game=${encodeURIComponent(game)}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return res.json() as Promise<SavedArmy[]>
}

export const fetchArmyById = async (id: string, token: string) => {
  const res = await fetch(`${BASE_URL}/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return res.json() as Promise<SavedArmy>
}

export const saveArmy = async (army: Partial<SavedArmy>, token: string) => {
  await fetch(BASE_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(army),
  })
}

export const deleteArmy = async (id: string, token: string) => {
  await fetch(`${BASE_URL}/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}
