import { useTranslation } from "react-i18next";

type Props = {
  armyName: string
  setArmyName: (name: string) => void
}

export default function ArmyNameInput({
  armyName,
  setArmyName,
}: Props) {
  const { t } = useTranslation();
  return (
    <div className="w-full max-w-2xl mb-3 space-y-3">
      <input
        className="p-2 text-black rounded w-full"
        placeholder={t('nameYourArmy')}
        value={armyName}
        onChange={e => setArmyName(e.target.value)}
      />
    </div>
  )
}
