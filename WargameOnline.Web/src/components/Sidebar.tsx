import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTranslation } from 'react-i18next'

export default function Sidebar() {
  const { logout } = useAuth()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  if (pathname === '/login' || pathname === '/register') return null

  return (
    <aside className="bg-surface border-r border-border w-full sm:w-64 p-6 space-y-4 flex flex-col justify-between">
      <div>
        <h2 className="text-xl font-bold text-primary">⚔ WarGame Online</h2>
        <nav className="space-y-2 text-sm font-medium mt-4">
          <button
            onClick={() => navigate('/armyCreator')}
            className="w-full text-left block p-2 rounded hover:bg-gray-700"
          >
            {t('armyCreator')}
          </button>
          <button
            onClick={() => navigate('/play')}
            className="w-full text-left block p-2 rounded hover:bg-gray-700"
          >
            {t('play')}
          </button>
          <button
            onClick={() => navigate('/settings')}
            className="w-full text-left block p-2 rounded hover:bg-gray-700"
          >
            {t('settings')}
          </button>
        </nav>
      </div>

      <button
        onClick={logout}
        className="mt-6 text-sm text-gray-400 hover:text-red-400 transition-colors"
      >
        {t('logout')}
      </button>
    </aside>
  )
}
