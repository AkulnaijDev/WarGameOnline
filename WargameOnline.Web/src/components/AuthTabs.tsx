import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTranslation } from 'react-i18next'

export default function AuthTabs() {
  const [tab, setTab] = useState<'login' | 'register'>('login')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()
  const { login, register } = useAuth()
  const { t } = useTranslation()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await register(username, email, password)
      alert(t('registrationCompleted'))
      setTab('login')
      setUsername('')
      setEmail('')
      setPassword('')
    } catch (err) {
      alert(t('registrationError'))
      console.error(err)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await login(email, password)
      navigate('/home')
    } catch (err) {
      alert(t('invalidCredentials'))
      console.error(err)
    }
  }

  return (
    <div>
      <div className="flex mb-6 border-b border-gray-300">
        {(['login', 'register'] as const).map((tKey) => (
          <button
            key={tKey}
            onClick={() => setTab(tKey)}
            className={`flex-1 py-2 font-semibold text-lg transition-colors ${
              tab === tKey
                ? 'text-indigo-600 border-b-2 border-indigo-500'
                : 'text-gray-400 hover:text-indigo-400'
            }`}
          >
            {t(tKey)}
          </button>
        ))}
      </div>

      {tab === 'login' ? (
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="text"
            placeholder={t('email')}
            className="input"
          />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder={t('password')}
            className="input"
          />
          <button type="submit" className="btn-primary w-full mt-2">
            {t('login')}
          </button>
        </form>
      ) : (
        <form onSubmit={handleRegister} className="space-y-4">
          <input
            type="text"
            placeholder={t('name')}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="input"
          />
          <input
            type="text"
            placeholder={t('email')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input"
          />
          <input
            type="password"
            placeholder={t('password')}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input"
          />
          <button type="submit" className="btn-primary w-full">
            {t('register')}
          </button>
        </form>
      )}
    </div>
  )
}
