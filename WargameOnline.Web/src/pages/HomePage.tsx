import { useAuth } from '../context/AuthContext'
import { useTranslation } from 'react-i18next'

export default function HomePage() {
  const { logout } = useAuth()
  const { t } = useTranslation()

  return (
    <div className="min-h-screen flex flex-col sm:flex-row bg-bg text-gray-100">
      <aside className="bg-surface border-r border-border w-full sm:w-64 p-6 space-y-4 flex flex-col justify-between">
        <div>
          <h2 className="text-xl font-bold text-primary">⚔ WarGame Online</h2>
          <nav className="space-y-2 text-sm font-medium mt-4">
            <a href="#" className="block p-2 rounded hover:bg-gray-700">{t('armyCreator')}</a>
            <a href="#" className="block p-2 rounded hover:bg-gray-700">{t('play')}</a>
            <a href="#" className="block p-2 rounded hover:bg-gray-700">{t('settings')}</a>
          </nav>
        </div>
        <button
          onClick={logout}
          className="mt-6 text-sm text-gray-400 hover:text-red-400 transition-colors"
        >
          Logout
        </button>
      </aside>

      <main className="flex-1 p-6">
        <h1 className="text-2xl font-semibold mb-4">Benvenuto nella Home</h1>
        <p className="text-gray-300">Qui troverai tutte le funzionalità principali del gioco.</p>
      </main>
    </div>
  )
}
