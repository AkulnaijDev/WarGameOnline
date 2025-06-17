import { useState, useEffect } from 'react'
import { useFriends } from '../context/FriendsContext'

type PendingUser = {
  id: number
  username: string
}

export default function FriendsSidebar() {
  const { friends, openChat, pendingCount } = useFriends()
  const [username, setUsername] = useState('')
  const [feedback, setFeedback] = useState('')
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([])

  const token = localStorage.getItem('token')

  // 🔄 Carica richieste ricevute
  const fetchPendingUsers = async () => {
    if (!token) return
    try {
      const res = await fetch('https://localhost:5103/api/friends/pending', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      setPendingUsers(data)
    } catch {
      setPendingUsers([])
    }
  }

  useEffect(() => {
    fetchPendingUsers()
    const interval = setInterval(fetchPendingUsers, 10000)
    return () => clearInterval(interval)
  }, [token])

  // ➕ Aggiungi amico
  const handleAdd = async () => {
    if (!username.trim()) return
    try {
      const res = await fetch('https://localhost:5103/api/friends/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ username }),
      })
      const msg = await res.text()
      setFeedback(res.ok ? `✅ ${msg}` : `❌ ${msg}`)
      if (res.ok) setUsername('')
    } catch {
      setFeedback('❌ Errore di rete.')
    }
    setTimeout(() => setFeedback(''), 4000)
  }

  // 🤝 Accetta o rifiuta richiesta
  const respond = async (username: string, action: 'Accept' | 'Reject') => {
    try {
      await fetch('https://localhost:5103/api/friends/respond', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ username, action }),
      })
      fetchPendingUsers()
    } catch {
      // optional: error feedback
    }
  }

  return (
    <div className="fixed bottom-4 right-4 w-72 bg-slate-800 border border-slate-600 rounded-xl shadow-xl text-sm z-50">
      <div className="flex justify-between items-center px-3 py-2 border-b border-slate-600">
        <h3 className="font-semibold text-white">Amici</h3>
        {pendingCount > 0 && (
          <span className="bg-red-600 text-white text-xs px-2 py-0.5 rounded-full">
            {pendingCount}
          </span>
        )}
      </div>

      {/* ➕ Aggiungi amico */}
      <div className="p-2 border-b border-slate-600">
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username (es. Terminator)"
          className="w-full px-2 py-1 text-sm rounded bg-slate-700 text-white placeholder-slate-400 mb-2"
        />
        <button
          onClick={handleAdd}
          className="w-full text-xs bg-indigo-600 text-white py-1 rounded hover:bg-indigo-500"
        >
          ➕ Aggiungi amico
        </button>
        {feedback && <p className="mt-1 text-xs text-white">{feedback}</p>}
      </div>

      {/* 📨 Richieste ricevute */}
      {pendingUsers.length > 0 && (
        <div className="px-3 py-2 border-b border-slate-600">
          <p className="text-xs text-slate-300 mb-2 font-semibold">Richieste in arrivo</p>
          <ul className="space-y-1">
            {pendingUsers.map((u) => (
              <li key={u.id} className="flex justify-between items-center">
                <span className="text-white">{u.username}</span>
                <div className="flex gap-1">
                  <button
                    className="text-green-400 hover:underline"
                    onClick={() => respond(u.username, 'Accept')}
                  >
                    ✓
                  </button>
                  <button
                    className="text-red-400 hover:underline"
                    onClick={() => respond(u.username, 'Reject')}
                  >
                    ✕
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 👥 Amici */}
      <ul className="p-2 max-h-64 overflow-y-auto">
        {friends.map((friend) => (
          <li key={friend.id} className="flex justify-between items-center mb-2">
            <span className="flex items-center gap-2 text-white">
              <span className={`h-2 w-2 rounded-full ${
                friend.isOnline ? 'bg-green-400' : 'bg-gray-500'
              }`} />
              {friend.username}
            </span>
            <button
              onClick={() => openChat(friend)}
              className="text-indigo-400 hover:underline"
            >
              Chat
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
