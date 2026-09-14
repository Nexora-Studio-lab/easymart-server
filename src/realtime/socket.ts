import { Server as HttpServer } from 'http'
import { Server as SocketIOServer, Socket } from 'socket.io'

let ioInstance: SocketIOServer | null = null

export function initRealtime(server: HttpServer): SocketIOServer {
  const io = new SocketIOServer(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
      allowedHeaders: ['*']
    },
    transports: ['websocket', 'polling'],
    pingTimeout: 30000,
    pingInterval: 10000,
    allowEIO3: true
  })

  io.on('connection', (socket: Socket) => {
    const clientIp = socket.handshake.address
    console.log(`[Socket.IO] Client connected: ${socket.id} (IP: ${clientIp})`)

    // Join store room by HWID
    socket.on('join:hwid', (hwid: string) => {
      if (hwid && typeof hwid === 'string') {
        const cleanHwid = hwid.trim()
        const roomName = `store:${cleanHwid}`
        socket.join(roomName)
        console.log(`[Socket.IO] Socket ${socket.id} joined room ${roomName}`)
        socket.emit('joined:hwid', { room: roomName, success: true, timestamp: new Date().toISOString() })
      }
    })

    // Allow client to leave room
    socket.on('leave:hwid', (hwid: string) => {
      if (hwid && typeof hwid === 'string') {
        const roomName = `store:${hwid.trim()}`
        socket.leave(roomName)
        console.log(`[Socket.IO] Socket ${socket.id} left room ${roomName}`)
      }
    })

    socket.on('disconnect', (reason) => {
      console.log(`[Socket.IO] Client disconnected: ${socket.id} (${reason})`)
    })
  })

  ioInstance = io
  return io
}

export function getIO(): SocketIOServer | null {
  return ioInstance
}

/**
 * Broadcast real-time change with ZERO latency to all connected subscribers in the store room.
 */
export function broadcastChange(
  hwid: string,
  table: string,
  action: 'INSERT' | 'UPDATE' | 'DELETE' | 'SYNC',
  payloadData: any
): void {
  if (!ioInstance) return

  const cleanHwid = (hwid || '').trim()
  const timestamp = new Date().toISOString()

  const eventPayload: Record<string, any> = {
    table,
    action,
    hwid: cleanHwid,
    timestamp
  }

  if (Array.isArray(payloadData)) {
    eventPayload.records = payloadData
  } else {
    eventPayload.record = payloadData
  }

  if (cleanHwid) {
    const roomName = `store:${cleanHwid}`
    // Broadcast to specific store room
    ioInstance.to(roomName).emit('realtime:change', eventPayload)
    // Also emit to all sockets in case they haven't joined the room yet
    ioInstance.emit('realtime:change', eventPayload)
    console.log(`[Realtime Broadcast] table=${table} action=${action} hwid=${cleanHwid} -> room ${roomName}`)
  } else {
    // Broadcast globally
    ioInstance.emit('realtime:change', eventPayload)
    console.log(`[Realtime Broadcast] Global table=${table} action=${action}`)
  }
}
