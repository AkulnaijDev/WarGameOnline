import { useState } from 'react'

export default function AuthTabs() {
  const [tab, setTab] = useState<'login' | 'register'>('login')

  return (
    <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
      <div className="flex mb-6 border-b">
        {['login', 'register'].map(t => (
          <button
            key={t}
            onClick={() => setTab(t as any)}
            className={`flex-1 py-2 font-medium ${
              tab === t ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-400'
            }`}
          >
            {t === 'login' ? 'Accedi' : 'Registrati'}
          </button>
        ))}
      </div>

      {tab === 'login' ? (
        <form className="flex flex-col gap-4">
          <input type="email" placeholder="Email" className="input" />
          <input type="password" placeholder="Password" className="input" />
          <button className="btn-primary">Login</button>
        </form>
      ) : (
        <form className="flex flex-col gap-4">
          <input type="text" placeholder="Nome" className="input" />
          <input type="email" placeholder="Email" className="input" />
          <input type="password" placeholder="Password" className="input" />
          <button className="btn-primary">Registrati</button>
        </form>
      )}
    </div>
  )
}
