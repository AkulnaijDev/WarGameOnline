import { useAuth } from '../context/AuthContext'
import { useTranslation } from 'react-i18next'
import { jwtDecode } from 'jwt-decode'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'

type JwtPayload = {
  [key: string]: string
}

export default function HomePage() {
  const { token, logout } = useAuth()
  const { t } = useTranslation()
const navigate = useNavigate()
  let username = 'UnknownUser'

  if (token) {
    const payload = jwtDecode<JwtPayload>(token)
    username =
      payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] ||
      payload.name ||
      'UnknownUser'
  }

  return (
    <div className="min-h-screen flex flex-col sm:flex-row bg-bg text-gray-100">
      <Sidebar />

      <main className="flex-1 p-6">
        <h1 className="text-2xl font-semibold mb-4">{username} — {t('welcomeHome')}</h1>
        <p className="text-gray-300">{t('welcomeHomeSubtext')}</p>
      </main>
    </div>
  )
}
