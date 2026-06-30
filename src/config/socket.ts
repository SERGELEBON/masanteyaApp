import { Server } from 'socket.io'
import { Server as HttpServer } from 'http'
import jwt from 'jsonwebtoken'
import { env } from './env'
import { prisma } from './database'

interface SocketData {
  userId: string
  role: string
}

export function initSocket(httpServer: HttpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: env.CORS_ORIGINS.split(','),
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  })

  io.use((socket, next) => {
    const token = socket.handshake.auth.token

    if (!token) {
      return next(new Error('Authentication token missing'))
    }

    try {
      const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as {
        sub: string
        role: string
      }
      socket.data.userId = payload.sub
      socket.data.role = payload.role
      next()
    } catch {
      next(new Error('Invalid authentication token'))
    }
  })

  io.on('connection', (socket) => {
    const { userId, role } = socket.data as SocketData

    console.log(`Socket connected: ${userId} (${role})`)

    socket.on('join_consultation', (roomId: string) => {
      socket.join(`consultation:${roomId}`)
      socket.to(`consultation:${roomId}`).emit('peer_joined', { userId })
    })

    socket.on(
      'send_message',
      async (data: { roomId: string; content: string; type: string; consultationId: string }) => {
        try {
          const message = await prisma.message.create({
            data: {
              consultationId: data.consultationId,
              senderId: userId,
              content: data.content,
              type: data.type,
            },
          })

          io.to(`consultation:${data.roomId}`).emit('new_message', {
            id: message.id,
            senderId: userId,
            content: message.content,
            type: message.type,
            createdAt: message.createdAt.toISOString(),
          })
        } catch (error) {
          console.error('Error saving message:', error)
        }
      }
    )

    socket.on('leave_consultation', (roomId: string) => {
      socket.leave(`consultation:${roomId}`)
      socket.to(`consultation:${roomId}`).emit('peer_left', { userId })
    })

    socket.on(
      'vital_alert',
      (data: { patientId: string; type: string; value: unknown; status: string }) => {
        io.to(`doctor:${data.patientId}`).emit('vital_alert_received', {
          ...data,
          timestamp: new Date().toISOString(),
        })
      }
    )

    socket.on('courier_location', (data: { orderId: string; lat: number; lng: number }) => {
      io.to(`order:${data.orderId}`).emit('courier_position', {
        lat: data.lat,
        lng: data.lng,
        timestamp: new Date().toISOString(),
      })
    })

    socket.on('join_order_tracking', (orderId: string) => {
      socket.join(`order:${orderId}`)
    })

    socket.on('leave_order_tracking', (orderId: string) => {
      socket.leave(`order:${orderId}`)
    })

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${userId}`)
    })
  })

  return io
}
