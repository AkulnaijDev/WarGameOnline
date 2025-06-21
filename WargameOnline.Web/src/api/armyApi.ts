import { SavedArmy } from '../types/types'
import { API } from '../lib/api'
import { fetchWithAuth } from '../utils/fetchWithAuth'
import { ArmyInput, ArmySummary, Army, ArmyInputWithId } from '../types/types'

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

export const saveArmy = async (
  army: ArmyInputWithId,
  token: string | null
): Promise<{ id: number }> => {
  if (!token) throw new Error('Token mancante');

  const response = await fetch(API.armies, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(army)
  });

  if (!response.ok) throw new Error('Errore salvataggio armata');

  return await response.json(); // { id: 123 }
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
