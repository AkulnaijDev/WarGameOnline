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

type PendingUser = {
  id: number
  username: string
}

type Message = {
  text: string
  senderId: number
  timestamp: string
}

type FriendsContextType = {
  friends: Friend[]
  activeChat: Friend | null
  setActiveChat: React.Dispatch<React.SetStateAction<Friend | null>>
  openChat: (f: Friend) => void
  closeChat: () => void
  messages: { [userId: number]: Message[] }
  setMessages: React.Dispatch<React.SetStateAction<{ [userId: number]: Message[] }>>
  currentUserId: number
  pendingUsers: PendingUser[]
  setPendingUsers: React.Dispatch<React.SetStateAction<PendingUser[]>>
}

const FriendsContext = createContext<FriendsContextType | undefined>(undefined)

export const useFriends = () => {
  const context = useContext(FriendsContext)
  if (!context) throw new Error('Please call useFriends inside FriendsProvider')
  return context
}

// ...import e types invariati...

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
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([])

  // ✅ Carica amici all’avvio
  useEffect(() => {
    if (!token || !currentUserId) return

    fetch(API.friends, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then((data: Friend[]) =>
        setFriends(data.filter((f: Friend) => f.id !== currentUserId))
      )
      .catch(console.error)
  }, [token, currentUserId])

  // ✅ Carica richieste pending all’avvio
  useEffect(() => {
    if (!token) return

    fetch(API.friendsPending, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then((pending: PendingUser[]) => {
        setPendingUsers(pending)
      })
      .catch(console.error)
  }, [token])

  const updateOnlineStatus = (id: number, online: boolean) => {
    setFriends(prev =>
      prev.map(f => f.id === id ? { ...f, isOnline: online } : f)
    )
  }

  // 🔌 Inizializza SignalR
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

        const sender = friends.find(f => f.id === fromId)

        if (!sender) {
          fetch(API.friends, {
            headers: { Authorization: `Bearer ${token}` }
          })
            .then(res => res.json())
            .then((updated: Friend[]) => {
              setFriends(updated.filter(f => f.id !== currentUserId))
              const s = updated.find(f => f.id === fromId)
              if (s) setActiveChat(s)
            })
            .catch(console.error)
        } else {
          setActiveChat(prev => {
            if (prev && prev.id === fromId) return prev
            return sender
          })
        }
      },
      updateOnlineStatus,
      {
        onFriendRequestReceived: (pending: PendingUser) => {
          setPendingUsers(prev => [
            ...prev.filter(u => u.id !== pending.id),
            pending
          ])
        },
        onFriendRequestAccepted: (newFriend: Friend) => {
          setFriends(prev => [...prev, newFriend])
        },
        onFriendRemoved: (removedId: number) => {
          setFriends(prev => prev.filter(f => f.id !== removedId))
          setActiveChat(prev => (prev && prev.id === removedId ? null : prev))
        },
      }
    )
  }, [token, currentUserId, friends])

  const openChat = (friend: Friend) => setActiveChat(friend)
  const closeChat = () => setActiveChat(null)

  return (
    <FriendsContext.Provider
      value={{
        friends,
        activeChat,
        setActiveChat,
        openChat,
        closeChat,
        messages,
        setMessages,
        currentUserId,
        pendingUsers,
        setPendingUsers,
      }}
    >
      {children}
    </FriendsContext.Provider>
  )
}

