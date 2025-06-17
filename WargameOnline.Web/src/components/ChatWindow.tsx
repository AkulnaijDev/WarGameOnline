import { useEffect, useState, useRef } from 'react'
import { HubConnectionBuilder, HubConnection } from '@microsoft/signalr'
import { useFriends } from '../context/FriendsContext'

export default function ChatWindow() {
  const { activeChat, closeChat } = useFriends()
  const [messages, setMessages] = useState<string[]>([])
  const [text, setText] = useState('')
  const connectionRef = useRef<HubConnection | null>(null)

  // 🔗 Avvio SignalR client
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return

    const conn = new HubConnectionBuilder()
      .withUrl('https://localhost:5103/hub/friends', {
        accessTokenFactory: () => token!,
      })
      .withAutomaticReconnect()
      .build()

    conn.start()
    connectionRef.current = conn

    conn.on('ReceiveMessage', (fromUserId: number, message: string) => {
      if (fromUserId === activeChat?.id) {
        setMessages((prev) => [...prev, message])
      }
    })

    return () => {
      conn.stop()
    }
  }, [activeChat])

  if (!activeChat) return null

  const send = () => {
    const msg = text.trim()
    if (!msg || !connectionRef.current) return

    // 🔽 Visualizza subito il messaggio localmente
    setMessages([...messages, msg])
    setText('')

    // 🔼 Invia via SignalR
    connectionRef.current.invoke('SendMessage', activeChat.id, msg).catch(console.error)
  }

  return (
    <div className="fixed bottom-4 right-72 w-64 bg-gray-900 text-white p-3 rounded-lg shadow-lg z-50 border border-slate-600">
      <div className="flex justify-between items-center mb-2 border-b border-slate-600 pb-1">
        <h4 className="font-semibold">{activeChat.username}</h4>
        <button
          onClick={closeChat}
          className="text-slate-400 hover:text-white text-sm"
        >
          ✕
        </button>
      </div>
      <div className="bg-slate-800 h-40 overflow-y-auto p-2 text-sm mb-2 rounded">
        {messages.map((m, i) => (
          <div key={i} className="mb-1">{m}</div>
        ))}
      </div>
      <div className="flex gap-1">
        <input
          className="flex-1 text-black px-2 py-1 rounded"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
        />
        <button
          onClick={send}
          className="text-sm px-2 py-1 bg-indigo-600 rounded text-white hover:bg-indigo-500"
        >
          Invia
        </button>
      </div>
    </div>
  )
}
