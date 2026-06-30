import { io, Socket } from 'socket.io-client'
import * as SecureStore from 'expo-secure-store'

let socket: Socket | null = null

export async function getSocket(): Promise<Socket> {
  if (socket?.connected) return socket

  const token = await SecureStore.getItemAsync('access_token')

  socket = io(process.env.EXPO_PUBLIC_SOCKET_URL!, {
    auth: { token },
    transports: ['websocket'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  })

  socket.on('connect', () => console.log('✅ Socket connecté:', socket?.id))
  socket.on('disconnect', (reason) => console.log('❌ Socket déconnecté:', reason))
  socket.on('connect_error', (err) => console.error('⚠️ Socket erreur:', err.message))

  return socket
}

export async function disconnectSocket() {
  socket?.disconnect()
  socket = null
}
