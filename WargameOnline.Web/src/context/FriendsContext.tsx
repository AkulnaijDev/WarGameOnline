import {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from 'react'
import { useSocket } from '../hooks/useSocket'

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

  // 🔐 Leggi token e ID utente
  useEffect(() => {
    const t = localStorage.getItem('token')
    if (!t) return
    setToken(t)

    try {
      const payload = JSON.parse(atob(t.split('.')[1]))
      const idClaim = payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier']
      setCurrentUserId(parseInt(idClaim))
    } catch (err) {
      console.error('Errore parsing JWT:', err)
    }
  }, [])

  // 🔁 Carica amici alla login
  useEffect(() => {
    if (!token) return

    const fetchFriends = async () => {
      try {
        const res = await fetch('https://localhost:5103/api/friends', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.ok) {
          const data = await res.json()
          setFriends(data)
        }
      } catch (err) {
        console.error('Errore fetching amici:', err)
      }
    }

    fetchFriends()
    const interval = setInterval(fetchFriends, 10000)
    return () => clearInterval(interval)
  }, [token])

  // ✅ Aggiorna stato online
  const updateOnlineStatus = (id: number, online: boolean) => {
    setFriends(prev =>
      prev.map(f =>
        f.id === id ? { ...f, isOnline: online } : f
      )
    )
  }

  // ⚡️ Gestione messaggi e connessioni SignalR
  useSocket(
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

      setActiveChat((prev) =>
        !prev || prev.id !== fromId
          ? friends.find((f) => f.id === fromId) || null
          : prev
      )
    },
    updateOnlineStatus // 👈 callback per FriendOnline/FriendOffline
  )

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
  if (!context) throw new Error('useFriends deve essere usato dentro FriendsProvider')
  return context
}
