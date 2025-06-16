import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTranslation } from 'react-i18next'

export default function AuthTabs() {
  const [tab, setTab] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()
  const { login } = useAuth()
  const { t } = useTranslation()

  const fakeRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    // 🔒 FUTURA CHIAMATA API:
    /*
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (data.success) {
        setTab('login')
      } else {
        alert('Errore nella registrazione.')
      }
    } catch (err) {
      console.error('Errore:', err)
    }
    */

    // Logica fake attuale:
    setTimeout(() => {
      alert(t('Registrazione completata'))
      setTab('login')
      setEmail('')
      setPassword('')
    }, 1000)
  }

  const fakeLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    // 🔐 FUTURA CHIAMATA API:
    /*
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json()
    if (data.token) {
      localStorage.setItem('token', data.token)
      login()
      navigate('/home')
    } else {
      alert('Credenziali non valide')
    }
    */

    if (email === 'a' && password === 'a') {
      login()
      navigate('/home')
    } else {
      alert(t('Credenziali non valide'))
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
        <form onSubmit={fakeLogin} className="space-y-4">
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
          <button type="submit" className="btn-primary w-full mt-2">{t('login')}</button>
        </form>
      ) : (
        <form onSubmit={fakeRegister} className="space-y-4">
          <input type="text" placeholder={t('name')} className="input" />
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
          <button type="submit" className="btn-primary w-full">{t('register')}</button>
        </form>
      )}
    </div>
  )
}
