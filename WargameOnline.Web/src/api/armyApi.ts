import { useTranslation } from "react-i18next";

import { API } from "../lib/api";
import { SavedArmy } from "../types/types";
import { fetchWithAuth } from "../utils/fetchWithAuth";
import { Army, ArmyInput, ArmyInputWithId, ArmySummary } from "../types/types";

export const fetchArmiesByGame = (
  game: string,
  token: string | null,
  setToken: (t: string) => void
) => {
  const { t } = useTranslation();
  if (!token) throw new Error(t("missingToken"));
  return fetchWithAuth<SavedArmy[]>(
    `${API.armies}?game=${encodeURIComponent(game)}`,
    {},
    token,
    setToken
  );
};

export const fetchArmies = (token: string | null) => {
  const { t } = useTranslation();
  if (!token) throw new Error(t("missingToken"));
  return fetchWithAuth<ArmySummary[]>(API.armies, {}, token);
};

export const fetchArmyById = (id: number, token: string | null) => {
  const { t } = useTranslation();
  if (!token) throw new Error(t("missingToken"));
  return fetchWithAuth<Army>(`${API.armies}/${id}`, {}, token);
};

export const saveArmy = async (
  army: ArmyInputWithId,
  token: string | null
): Promise<{ id: number }> => {
  const { t } = useTranslation();
  if (!token) throw new Error(t("missingToken"));

  const response = await fetch(API.armies, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(army),
  });

  if (!response.ok) throw new Error(t("errorSavingArmylist"));

  return await response.json();
};

export const updateArmy = (
  army: ArmyInput & { id: number },
  token: string | null
) => {
  const { t } = useTranslation();
  if (!token) throw new Error(t("missingToken"));

  return fetchWithAuth<void>(
    `${API.armies}/${army.id}`,
    {
      method: "PUT",
      body: JSON.stringify(army),
    },
    token
  );
};

export const deleteArmy = (id: number, token: string | null) => {
  const { t } = useTranslation();
  if (!token) throw new Error(t("missingToken"));

  return fetchWithAuth<void>(
    `${API.armies}/${id}`,
    {
      method: "DELETE",
    },
    token
  );
};
