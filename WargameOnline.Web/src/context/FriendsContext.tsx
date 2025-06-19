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

export const useFriends = () => {
  const context = useContext(FriendsContext)
  if (!context) throw new Error('Please call useFriends inside FriendsProvider')
  return context
}

export const FriendsProvider = ({
  token,
  currentUserId,
  children,
}: {
  token: string
  currentUserId: number
  children: ReactNode
}) => {
  const [friends, setFriends] = useState<Friend[]>([])
  const [activeChat, setActiveChat] = useState<Friend | null>(null)
  const [messages, setMessages] = useState<{ [userId: number]: Message[] }>({})

  // 🔁 Carica amici all’avvio
  useEffect(() => {
     console.log('🎯 token:', token)
  console.log('🎯 currentUserId:', currentUserId)

    if (!token || !currentUserId) return

  const fetchFriends = async () => {
    try {
      console.log('🔁 chiamata a /api/friends in partenza...') // 👈 metti questo
      const res = await fetch(API.friends, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setFriends(data.filter((f: Friend) => f.id !== currentUserId))
      } else {
        console.warn('❌ errore nella fetch friends:', res.status)
      }
    } catch (err) {
      console.error('❌ Friends fetching error:', err)
    }
  }

    fetchFriends()
  }, [token, currentUserId])

  const updateOnlineStatus = (id: number, online: boolean) => {
    setFriends(prev =>
      prev.map(f =>
        f.id === id ? { ...f, isOnline: online } : f
      )
    )
  }

  useEffect(() => {
    if (!token || !currentUserId) return

    initializeSocket(
      token,
      (fromId, text) => {
        const newMsg: Message = {
          text,
          senderId: fromId,
          timestamp: new Date().toISOString(),
        }

        setMessages(prev => ({
          ...prev,
          [fromId]: [...(prev[fromId] || []), newMsg],
        }))

        setActiveChat(prev => {
          if (prev && prev.id === fromId) return prev
          const sender = friends.find(f => f.id === fromId)
          return sender ?? { id: fromId, username: `User#${fromId}`, isOnline: true }
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
