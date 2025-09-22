'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@clerk/nextjs'
import { Socket } from 'socket.io-client'
import { socketManager } from '@/lib/socket'

export function useSocket() {
  const { getToken, isLoaded } = useAuth()
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    if (!isLoaded) return

    const initSocket = async () => {
      try {
        const token = await getToken()
        if (token) {
          const socketInstance = socketManager.connect(token)
          setSocket(socketInstance)

          socketInstance.on('connect', () => {
            setIsConnected(true)
          })

          socketInstance.on('disconnect', () => {
            setIsConnected(false)
          })
        }
      } catch (error) {
        console.error('Failed to initialize socket:', error)
      }
    }

    initSocket()

    return () => {
      socketManager.disconnect()
      setSocket(null)
      setIsConnected(false)
    }
  }, [getToken, isLoaded])

  return { socket, isConnected }
}