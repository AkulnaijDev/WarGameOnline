import {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from 'react'

type Friend = {
  id: number
  username: string
  isOnline: boolean
}

type FriendsContextType = {
  friends: Friend[]
  activeChat: Friend | null
  pendingCount: number
  openChat: (f: Friend) => void
  closeChat: () => void
}

const FriendsContext = createContext<FriendsContextType | undefined>(undefined)

export const FriendsProvider = ({ children }: { children: ReactNode }) => {
  const [friends, setFriends] = useState<Friend[]>([])
  const [activeChat, setActiveChat] = useState<Friend | null>(null)
  const [pendingCount, setPendingCount] = useState(0)

  const token = localStorage.getItem('token')

  useEffect(() => {
    if (!token) return

    const fetchFriends = async () => {
      try {
        const [friendsRes, pendingRes] = await Promise.all([
          fetch('https://localhost:5103/api/friends', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch('https://localhost:5103/api/friends/pending', {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ])

        const friends = await friendsRes.json()
        const pending = await pendingRes.json()

        setFriends(friends)
        setPendingCount(pending.length)
      } catch (err) {
        console.error('Errore durante il fetch amici:', err)
      }
    }

    fetchFriends()
    const interval = setInterval(fetchFriends, 10000)
    return () => clearInterval(interval)
  }, [token])

  const openChat = (f: Friend) => setActiveChat(f)
  const closeChat = () => setActiveChat(null)

  return (
    <FriendsContext.Provider
      value={{ friends, activeChat, pendingCount, openChat, closeChat }}
    >
      {children}
    </FriendsContext.Provider>
  )
}

// Custom hook con controllo automatico
export const useFriends = () => {
  const context = useContext(FriendsContext)
  if (!context) throw new Error('useFriends deve essere usato dentro FriendsProvider')
  return context
}
