import { SavedArmy } from '../types/types'
import { API } from '../lib/api'
import { fetchWithAuth } from '../utils/fetchWithAuth'
import { ArmyInput, ArmySummary, Army } from '../types/types'

export const fetchArmiesByGame = (
  game: string,
  token: string | null,
  setToken: (t: string) => void
) => {
  if (!token) throw new Error('Token mancante')
  return fetchWithAuth<SavedArmy[]>(
    `${API.armies}?game=${encodeURIComponent(game)}`,
    {},
    token,
    setToken
  )
}

export const fetchArmies = (token: string | null) => {
  if (!token) throw new Error('Token mancante');
  return fetchWithAuth<ArmySummary[]>(API.armies, {}, token)
}

export const fetchArmyById = (id: number, token: string | null) => {
  if (!token) throw new Error('Token mancante');
  return fetchWithAuth<Army>(`${API.armies}/${id}`, {}, token)
}

export const saveArmy = (army: ArmyInput, token: string | null) => {
  if (!token) throw new Error('Token mancante');
  return fetchWithAuth<void>(
    API.armies,
    {
      method: 'POST',
      body: JSON.stringify(army)
    },
    token
  )
}

export const updateArmy = (army: ArmyInput & { id: number }, token: string | null) => {
  if (!token) throw new Error('Token mancante');
  return fetchWithAuth<void>(
    `${API.armies}/${army.id}`,
    {
      method: 'PUT',
      body: JSON.stringify(army)
    },
    token
  )
}

export const deleteArmy = (id: number, token: string | null) => {
  if (!token) throw new Error('Token mancante');
  return fetchWithAuth<void>(
    `${API.armies}/${id}`,
    {
      method: 'DELETE'
    },
    token
  )
}
