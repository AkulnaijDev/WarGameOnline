import { HubConnectionBuilder, HubConnection } from '@microsoft/signalr'
import { API } from '../lib/api'

declare global {
  interface Window {
    connection?: HubConnection
  }
}

let connection: HubConnection | null = null

export function resetSocket() {
  connection?.stop()
  connection = null
  window.connection = undefined
}

export function initializeSocket(
  token: string,
  onMessage: (from: number, text: string) => void,
  onStatusChange?: (id: number, online: boolean) => void
) {
  if (typeof window === 'undefined') return
  if (connection) return // già inizializzato

  connection = new HubConnectionBuilder()
    .withUrl(API.friendsChatHub, {
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
    .then(() => console.log('🛰️ SignalR is connected'))
    .catch((err) => console.error('❌ SignalR connection failed:', err))
}
