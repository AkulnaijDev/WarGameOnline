import { useEffect, useRef, useState } from 'react'
import { useFriends, Friend } from '../context/FriendsContext'
import { useTranslation } from 'react-i18next'

export default function ChatWindow({
  chatUser,
  onClose,
}: {
  chatUser: Friend
  onClose: () => void
}) {
  const {
    messages,
    setMessages,
    currentUserId,
    friends,
  } = useFriends()

  const { t } = useTranslation()
  const [input, setInput] = useState('')
  const [offlineWarning, setOfflineWarning] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const offset = useRef({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)

  const friend = friends.find(f => f.id === chatUser.id) ?? {
    ...chatUser,
    isOnline: false,
  }

  const initialX = window.innerWidth - 360 - (friend.id % 3) * 40
  const initialY = window.innerHeight - 420 - (friend.id % 3) * 40
  const [position, setPosition] = useState({ x: initialX, y: initialY })

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, chatUser])

  const connection = window.connection

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = input.trim()
    if (!trimmed || !friend.isOnline) {
      setOfflineWarning(t('offlineUserNoMsgSent'))
      return
    }

    const msg = {
      text: trimmed,
      senderId: currentUserId,
      timestamp: new Date().toISOString(),
    }

    setMessages(prev => ({
      ...prev,
      [friend.id]: [...(prev[friend.id] || []), msg],
    }))

    connection?.invoke('SendMessage', friend.id, trimmed)
    setInput('')
    setOfflineWarning('')
  }

  const startDrag = (e: React.MouseEvent) => {
    const box = containerRef.current?.getBoundingClientRect()
    if (box) {
      offset.current = {
        x: e.clientX - box.left,
        y: e.clientY - box.top,
      }
      setDragging(true)
    }
  }

  const onDrag = (e: MouseEvent) => {
    if (!dragging) return
    const winW = window.innerWidth
    const winH = window.innerHeight
    const width = containerRef.current?.offsetWidth || 320
    const height = containerRef.current?.offsetHeight || 400

    const x = Math.max(0, Math.min(e.clientX - offset.current.x, winW - width))
    const y = Math.max(0, Math.min(e.clientY - offset.current.y, winH - height))

    setPosition({ x, y })
  }

  const endDrag = () => setDragging(false)

  useEffect(() => {
    if (dragging) {
      document.addEventListener('mousemove', onDrag)
      document.addEventListener('mouseup', endDrag)
      return () => {
        document.removeEventListener('mousemove', onDrag)
        document.removeEventListener('mouseup', endDrag)
      }
    }
  }, [dragging])

  return (
    <div
      ref={containerRef}
      className="fixed z-50 w-80 max-h-[70vh] bg-surface border border-border rounded-md shadow-lg flex flex-col cursor-default"
      style={{ top: position.y, left: position.x }}
    >
      <div
        className="chat-header flex justify-between items-center p-3 border-b border-border bg-slate-700 text-white cursor-move rounded-t-md"
        onMouseDown={startDrag}
      >
        <div className="flex items-center gap-2">
          <span
            className={`h-2 w-2 rounded-full ${
              friend.isOnline ? 'bg-green-400' : 'bg-gray-400'
            }`}
            title={friend.isOnline ? 'Online' : 'Offline'}
          />
          <h3 className="font-semibold">{friend.username}</h3>
        </div>
        <button
          onClick={onClose}
          className="text-sm text-red-400 hover:text-red-300 transition"
          title={t('closeChat')}
        >
          ✖
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-background">
        {messages[friend.id]?.map((msg, i) => {
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
        {offlineWarning && (
          <div className="text-xs text-red-500 mt-2">{offlineWarning}</div>
        )}
      </div>

      {!friend.isOnline && (
        <div className="text-xs text-red-500 px-3 py-2 border-t border-border bg-slate-100">
          {t('userOffline') || t('userOfflineCantSend')}
        </div>
      )}

      <form
        onSubmit={handleSend}
        className="p-2 border-t border-border bg-background flex gap-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t('typeMessage')}
          className="flex-1 px-3 py-1 text-sm rounded bg-white text-black disabled:opacity-50"
          disabled={!friend.isOnline}
        />
        <button
          type="submit"
          disabled={!friend.isOnline}
          className={`text-sm px-3 py-1 rounded transition ${
            friend.isOnline
              ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
              : 'bg-gray-400 text-gray-200 cursor-not-allowed'
          }`}
        >
          {t('send')}
        </button>
      </form>
    </div>
  )
}
