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
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem('token')
    setToken(stored)
  }, [])

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

        if (!friendsRes.ok || !pendingRes.ok) {
          const text = await friendsRes.text()
          throw new Error(`Errore API: ${text}`)
        }

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

  // 👇 Mostra un messaggio se l’utente non è loggato
  if (!token) {
    return (
      <div className="text-sm text-slate-400 px-4 py-2">
        Effettua il login per accedere alla lista amici
      </div>
    )
  }

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
