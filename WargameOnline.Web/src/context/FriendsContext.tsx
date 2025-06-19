import {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from 'react'

import { initializeSocket } from '../hooks/useSocket'
import { API } from '../lib/api'

type Friend = {
  id: number
  username: string
  isOnline: boolean
}

type Message = {
  text: string
  senderId: number
  timestamp: string
}

type FriendsContextType = {
  friends: Friend[]
  activeChat: Friend | null
  openChat: (f: Friend) => void
  closeChat: () => void
  messages: { [userId: number]: Message[] }
  setMessages: React.Dispatch<React.SetStateAction<{ [userId: number]: Message[] }>>
  currentUserId: number
}

const FriendsContext = createContext<FriendsContextType | undefined>(undefined)

export const FriendsProvider = ({ children }: { children: ReactNode }) => {
  const [friends, setFriends] = useState<Friend[]>([])
  const [activeChat, setActiveChat] = useState<Friend | null>(null)
  const [messages, setMessages] = useState<{ [userId: number]: Message[] }>({})
  const [token, setToken] = useState<string | null>(null)
  const [currentUserId, setCurrentUserId] = useState<number>(0)

  // 🔐 Read token and User Id
  useEffect(() => {
    const t = localStorage.getItem('token')
    if (!t) return
    setToken(t)

    try {
      const payload = JSON.parse(atob(t.split('.')[1]))
      const idClaim = payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier']
      setCurrentUserId(parseInt(idClaim))
    } catch (err) {
      console.error('JWT parsing error:', err)
    }
  }, [])

  // 🔁 Load friends in login
  useEffect(() => {
    if (!token) return

    const fetchFriends = async () => {
      try {
        const res = await fetch(API.friends, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.ok) {
          const data = await res.json()
          setFriends(data)
        }
      } catch (err) {
        console.error('Friends fetching error:', err)
      }
    }

    fetchFriends()
    const interval = setInterval(fetchFriends, 10000)
    return () => clearInterval(interval)
  }, [token])

  // ✅ Update online status
  const updateOnlineStatus = (id: number, online: boolean) => {
    setFriends(prev =>
      prev.map(f =>
        f.id === id ? { ...f, isOnline: online } : f
      )
    )
  }

  // ⚡️ Message handling signalR connections
  useEffect(() => {
    if (!token || !currentUserId) return

    initializeSocket(
      token,
      (fromId, text) => {
        const newMsg = {
          text,
          senderId: fromId,
          timestamp: new Date().toISOString(),
        }

        setMessages((prev) => ({
          ...prev,
          [fromId]: [...(prev[fromId] || []), newMsg],
        }))

        setActiveChat((prev) => {
          if (prev && prev.id === fromId) return prev
          const sender = friends.find((f) => f.id === fromId)
          if (sender) return sender

          // 🔁 fallback: create a temp friend if unknown
          return { id: fromId, username: `User#${fromId}`, isOnline: true }
        })

      },
      updateOnlineStatus
    )
  }, [token, currentUserId, friends])


  const openChat = (friend: Friend) => setActiveChat(friend)
  const closeChat = () => setActiveChat(null)

  return (
    <FriendsContext.Provider
      value={{
        friends,
        activeChat,
        openChat,
        closeChat,
        messages,
        setMessages,
        currentUserId,
      }}
    >
      {children}
    </FriendsContext.Provider>
  )
}

export const useFriends = () => {
  const context = useContext(FriendsContext)
  if (!context) throw new Error('Please call useFriends inside FriendsProvider')
  return context
}
