import { HubConnectionBuilder } from '@microsoft/signalr'
import { useEffect } from 'react'

export function useSocket(onMessage: (from: number, text: string) => void) {
  useEffect(() => {
    const token = localStorage.getItem('token')
    const conn = new HubConnectionBuilder()
      .withUrl('https://localhost:5103/hub/friends', {
        accessTokenFactory: () => token!,
      })
      .withAutomaticReconnect()
      .build()

    conn.start()

    conn.on('FriendOnline', (userId) => {
      console.log('🟢 Amico online:', userId)
    })

    conn.on('FriendOffline', (userId) => {
      console.log('🔴 Amico offline:', userId)
    })

    conn.on('ReceiveMessage', (fromId, text) => {
      onMessage(fromId, text)
    })

    return () => {
      conn.stop()
    }
  }, [onMessage])
}
