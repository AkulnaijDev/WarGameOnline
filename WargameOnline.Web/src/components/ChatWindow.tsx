import { useEffect, useRef, useState } from 'react'
import { useFriends } from '../context/FriendsContext'
import { useTranslation } from 'react-i18next'
import Draggable from 'react-draggable'

export default function ChatWindow() {
  const {
    activeChat,
    closeChat,
    messages,
    setMessages,
    currentUserId
  } = useFriends()

  const { t } = useTranslation()
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, activeChat])

  if (!activeChat) return null

  const connection = window.connection // SignalR global

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = input.trim()
    if (!trimmed || !activeChat?.isOnline) return

    const msg = {
      text: trimmed,
      senderId: currentUserId,
      timestamp: new Date().toISOString(),
    }

    setMessages((prev) => ({
      ...prev,
      [activeChat.id]: [...(prev[activeChat.id] || []), msg],
    }))

    connection?.invoke('SendMessage', activeChat.id, trimmed)
    setInput('')
  }

  return (
    <Draggable handle=".chat-header">
      <div className="fixed bottom-4 right-4 w-80 max-h-[70vh] bg-surface border border-border rounded-md shadow-lg flex flex-col z-50 cursor-default">
        <div className="chat-header flex justify-between items-center p-3 border-b border-border bg-slate-700 text-white cursor-move rounded-t-md">
          <h3 className="font-semibold">{activeChat.username}</h3>
          <button
            onClick={closeChat}
            className="text-sm text-red-400 hover:text-red-300 transition"
            title={t('closeChat')}
          >
            ✖
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-background">
          {messages[activeChat.id]?.map((msg, i) => {
            const isMine = msg.senderId === currentUserId
            const time = new Date(msg.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })

            return (
              <div
                key={i}
                className={`flex flex-col max-w-xs px-3 py-2 rounded-xl text-sm ${
                  isMine
                    ? 'bg-green-100 text-green-900 self-start rounded-bl-none'
                    : 'bg-blue-100 text-blue-900 self-end rounded-br-none'
                }`}
              >
                <span>{msg.text}</span>
                <span className="text-xs text-slate-500 text-right mt-1">{time}</span>
              </div>
            )
          })}
          <div ref={bottomRef} />
        </div>

        {!activeChat.isOnline && (
          <div className="text-xs text-red-500 px-3 py-2 border-t border-border bg-slate-100">
            {t('userOffline') || 'Questo utente è offline. Non puoi inviare messaggi al momento.'}
          </div>
        )}

        <form onSubmit={handleSend} className="p-2 border-t border-border bg-background flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t('typeMessage')}
            className="flex-1 px-3 py-1 text-sm rounded bg-white text-black disabled:opacity-50"
            disabled={!activeChat.isOnline}
          />
          <button
            type="submit"
            disabled={!activeChat.isOnline}
            className={`text-sm px-3 py-1 rounded transition ${
              activeChat.isOnline
                ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
                : 'bg-gray-400 text-gray-200 cursor-not-allowed'
            }`}
          >
            {t('send')}
          </button>
        </form>
      </div>
    </Draggable>
  )
}
