import { SavedArmy } from '../types/types'
import { API } from '../lib/api'
import { fetchWithAuth } from '../utils/fetchWithAuth'

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

export const fetchArmyById = (id: string, token: string | null) => {
  if (!token) throw new Error('Token mancante')
  return fetchWithAuth<SavedArmy>(`${API.armies}/${id}`, {}, token)
}

export const saveArmy = (army: Partial<SavedArmy>, token: string | null) => {
  if (!token) throw new Error('Token mancante')
  return fetchWithAuth<void>(
    API.armies,
    {
      method: 'POST',
      body: JSON.stringify(army),
    },
    token
  )
}

export const deleteArmy = (id: string, token: string | null) => {
  if (!token) throw new Error('Token mancante')
  return fetchWithAuth<void>(
    `${API.armies}/${id}`,
    {
      method: 'DELETE',
    },
    token
  )
}
