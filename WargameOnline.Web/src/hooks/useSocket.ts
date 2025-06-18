import { HubConnectionBuilder, HubConnection } from '@microsoft/signalr'

declare global {
  interface Window {
    connection?: HubConnection
  }
}

let connection: HubConnection | null = null

export function useSocket(
  onMessage: (from: number, text: string) => void,
  onStatusChange?: (id: number, online: boolean) => void
) {
  if (typeof window === 'undefined') return // ⛔ no SSR

  if (!connection) {
    const token = localStorage.getItem('token')
    if (!token) return

    connection = new HubConnectionBuilder()
      .withUrl('https://localhost:5103/hub/friends', {
        accessTokenFactory: () => token,
      })
      .withAutomaticReconnect()
      .build()

    window.connection = connection

    connection.on('FriendOnline', (id) => onStatusChange?.(id, true))
    connection.on('FriendOffline', (id) => onStatusChange?.(id, false))
    connection.on('ReceiveMessage', (fromId, text) => {
      onMessage(fromId, text)
    })


    connection
      .start()
      .then(() => console.log('🛰️ SignalR connesso'))
      .catch((err) => console.error('❌ Connessione SignalR fallita:', err))
  }
}
