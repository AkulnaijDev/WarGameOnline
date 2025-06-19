import { useState, useEffect } from 'react'
import { useFriends } from '../context/FriendsContext'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router-dom'
import { API } from '../lib/api'

type PendingUser = {
  id: number
  username: string
}

export default function FriendsSidebar() {
  const { friends, openChat } = useFriends()
  const [username, setUsername] = useState('')
  const [feedback, setFeedback] = useState('')
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([])
  const { t } = useTranslation()
  const token = localStorage.getItem('token')
  const pendingCount = pendingUsers.length
  const location = useLocation()
  const isAuth = location.pathname.startsWith('/auth')


  // 🔄 Load received friendship requests
  const fetchPendingUsers = async () => {
    if (!token) return
    try {
      const res = await fetch(API.friendsPending, {
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

  // ➕ Add a friend
  const handleAdd = async () => {
    if (!username.trim()) return
    try {
      const res = await fetch(API.friendsRequest, {
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

  // 🤝 Accept or deny request
  const respond = async (username: string, action: 'Accept' | 'Reject') => {
    try {
      await fetch(API.friendsRespond, {
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

  const handleRemove = async (id: number) => {
    const token = localStorage.getItem('token')
    if (!token) return

    await fetch(`${API.friendsChatHub}/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    // Update manually the list
    fetchPendingUsers()
  }


  return (
    <div className={`fixed bottom-4 right-4 w-72 bg-slate-800 border border-slate-600 rounded-xl shadow-xl text-sm z-50 ${isAuth ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
      <div className="flex justify-center items-center px-3 py-2 border-b border-slate-600 relative">
        <h3 className="font-semibold text-white tracking-wide text-xs">{t('friends')}</h3>
        {pendingCount > 0 && (
          <span className="absolute right-3 bg-red-600 text-white text-xs px-2 py-0.5 rounded-full">
            {pendingCount}
          </span>
        )}
      </div>


      {/* 📨 Received request */}
      {pendingUsers.length > 0 && (
        <div className="px-3 py-2 border-b border-slate-600">
          <p className="text-xs text-slate-300 mb-2 font-semibold">{t('arrivedFriendshipRequests')}</p>
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

      {/* 👥 Friends */}
      <ul className="p-2 max-h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-transparent">


        {friends.map((friend) => (
          <li key={friend.id} className="flex justify-between items-center gap-2 mb-2">
            {/* 🔵 Status + name on the left */}
            <span className="flex items-center gap-2 text-white">
              <span
                className={`h-2 w-2 rounded-full ${friend.isOnline ? 'bg-green-500' : 'bg-gray-400'}`}
                title={`${friend.isOnline ? t('online') : t('offline')}`}
              />
              {friend.username}
            </span>

            {/* ✉️ ❌ right buttons */}
            <div className="flex items-center gap-2 text-sm">
              <button
                onClick={() => openChat(friend)}
                title={t('openChat')}
                className="hover:text-blue-400"
              >
                ✉️
              </button>
              <button
                onClick={() => handleRemove(friend.id)}
                title={t('removeFriend')}
                className="hover:text-red-400"
              >
                ❌
              </button>
            </div>
          </li>
        ))}
      </ul>

      {/* ➕ Add friend */}
      <div className="p-2 border-t border-slate-700"></div>
      <div className="flex items-center gap-2 mb-1 px-2">

        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder={t('addFriend')}
          className="flex-1 px-2 py-1 text-sm rounded bg-slate-700 text-white placeholder-slate-400"
        />
        <button
          onClick={handleAdd}
          title={t('addFriend')}
          className="text-xs bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-500"
        >
          ➕
        </button>


      </div>
      {feedback && (
        <p
          className={`mt-1 mr-1 mb-1 ml-1 px-2 py-1 text-xs rounded ${feedback.startsWith('✅')
              ? 'bg-green-800 text-green-300'
              : 'bg-red-800 text-red-300'
            }`}
        >
          {feedback}
        </p>

      )}
    </div>
  )
}
