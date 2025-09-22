'use client'

import { io, Socket } from 'socket.io-client'
import { useAuth } from '@clerk/nextjs'

class SocketManager {
  private static instance: SocketManager
  private socket: Socket | null = null
  private token: string | null = null

  private constructor() {}

  static getInstance(): SocketManager {
    if (!SocketManager.instance) {
      SocketManager.instance = new SocketManager()
    }
    return SocketManager.instance
  }

  connect(token: string): Socket {
    if (this.socket?.connected && this.token === token) {
      return this.socket
    }

    if (this.socket) {
      this.socket.disconnect()
    }

    this.token = token
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001'
    
    this.socket = io(socketUrl, {
      auth: {
        token
      },
      transports: ['websocket', 'polling']
    })

    this.socket.on('connect', () => {
      console.log('Connected to Socket.IO server')
    })

    this.socket.on('disconnect', (reason) => {
      console.log('Disconnected from Socket.IO server:', reason)
    })

    this.socket.on('error', (error) => {
      console.error('Socket.IO error:', error)
    })

    return this.socket
  }

  getSocket(): Socket | null {
    return this.socket
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      this.token = null
    }
  }
}

export const socketManager = SocketManager.getInstance()