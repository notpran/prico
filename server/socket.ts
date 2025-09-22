import { Server } from 'socket.io'
import { createServer } from 'http'
import { verifyToken } from '@clerk/backend'
import cors from 'cors'

const port = process.env.SOCKET_PORT || 3001

// Create HTTP server
const httpServer = createServer()

// Create Socket.IO server with CORS configuration
const io = new Server(httpServer, {
  cors: {
    origin: process.env.NEXT_PUBLIC_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['websocket', 'polling']
})

// Store user sessions and room memberships
interface UserSession {
  userId: string
  username: string
  displayName: string
  communities: Set<string>
  typing: Map<string, boolean> // channelId -> isTyping
}

const userSessions = new Map<string, UserSession>()
const communityMembers = new Map<string, Set<string>>() // communityId -> Set of socketIds

// Middleware for authentication
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token
    if (!token) {
      throw new Error('No token provided')
    }

    // Verify Clerk JWT token
    const payload = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY!
    })

    if (!payload.sub) {
      throw new Error('Invalid token')
    }

    // Store user info in socket
    socket.data = {
      userId: payload.sub,
      username: payload.username || payload.sub,
      displayName: payload.name || payload.username || 'User'
    }

    next()
  } catch (error) {
    console.error('Socket authentication failed:', error)
    next(new Error('Authentication failed'))
  }
})

io.on('connection', (socket) => {
  const userId = socket.data.userId
  const username = socket.data.username
  const displayName = socket.data.displayName

  console.log(`User connected: ${displayName} (${userId})`)

  // Initialize user session
  userSessions.set(socket.id, {
    userId,
    username,
    displayName,
    communities: new Set(),
    typing: new Map()
  })

  // Handle joining a community
  socket.on('join_community', (communityId: string) => {
    const userSession = userSessions.get(socket.id)
    if (!userSession) return

    socket.join(`community:${communityId}`)
    userSession.communities.add(communityId)

    // Add to community members
    if (!communityMembers.has(communityId)) {
      communityMembers.set(communityId, new Set())
    }
    communityMembers.get(communityId)!.add(socket.id)

    // Notify other members
    socket.to(`community:${communityId}`).emit('user_joined', {
      userId,
      username,
      displayName
    })

    console.log(`${displayName} joined community ${communityId}`)
  })

  // Handle leaving a community
  socket.on('leave_community', (communityId: string) => {
    const userSession = userSessions.get(socket.id)
    if (!userSession) return

    socket.leave(`community:${communityId}`)
    userSession.communities.delete(communityId)

    // Remove from community members
    communityMembers.get(communityId)?.delete(socket.id)

    // Notify other members
    socket.to(`community:${communityId}`).emit('user_left', {
      userId,
      username,
      displayName
    })

    console.log(`${displayName} left community ${communityId}`)
  })

  // Handle sending messages
  socket.on('send_message', (data: {
    communityId: string
    channelId: string
    content: string
    replyToId?: string
    attachments?: string[]
  }) => {
    const userSession = userSessions.get(socket.id)
    if (!userSession || !userSession.communities.has(data.communityId)) {
      socket.emit('error', 'Not a member of this community')
      return
    }

    const message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      content: data.content,
      senderId: userId,
      sender: {
        id: userId,
        username,
        displayName,
      },
      communityId: data.communityId,
      channelId: data.channelId,
      replyToId: data.replyToId,
      attachments: data.attachments || [],
      reactions: [],
      createdAt: Date.now(),
      editedAt: null
    }

    // Broadcast to community
    io.to(`community:${data.communityId}`).emit('new_message', message)

    console.log(`Message sent in ${data.communityId}/${data.channelId} by ${displayName}`)
  })

  // Handle message editing
  socket.on('edit_message', (data: {
    messageId: string
    communityId: string
    content: string
  }) => {
    const userSession = userSessions.get(socket.id)
    if (!userSession || !userSession.communities.has(data.communityId)) {
      socket.emit('error', 'Not a member of this community')
      return
    }

    const updatedMessage = {
      messageId: data.messageId,
      content: data.content,
      editedAt: Date.now(),
      editedBy: userId
    }

    // Broadcast to community
    io.to(`community:${data.communityId}`).emit('message_edited', updatedMessage)
  })

  // Handle message deletion
  socket.on('delete_message', (data: {
    messageId: string
    communityId: string
  }) => {
    const userSession = userSessions.get(socket.id)
    if (!userSession || !userSession.communities.has(data.communityId)) {
      socket.emit('error', 'Not a member of this community')
      return
    }

    // Broadcast to community
    io.to(`community:${data.communityId}`).emit('message_deleted', {
      messageId: data.messageId,
      deletedAt: Date.now(),
      deletedBy: userId
    })
  })

  // Handle typing indicators
  socket.on('typing_start', (data: {
    communityId: string
    channelId: string
  }) => {
    const userSession = userSessions.get(socket.id)
    if (!userSession || !userSession.communities.has(data.communityId)) return

    userSession.typing.set(data.channelId, true)

    socket.to(`community:${data.communityId}`).emit('user_typing_start', {
      userId,
      username,
      displayName,
      channelId: data.channelId
    })
  })

  socket.on('typing_stop', (data: {
    communityId: string
    channelId: string
  }) => {
    const userSession = userSessions.get(socket.id)
    if (!userSession || !userSession.communities.has(data.communityId)) return

    userSession.typing.set(data.channelId, false)

    socket.to(`community:${data.communityId}`).emit('user_typing_stop', {
      userId,
      channelId: data.channelId
    })
  })

  // Handle reactions
  socket.on('add_reaction', (data: {
    messageId: string
    communityId: string
    emoji: string
  }) => {
    const userSession = userSessions.get(socket.id)
    if (!userSession || !userSession.communities.has(data.communityId)) return

    io.to(`community:${data.communityId}`).emit('reaction_added', {
      messageId: data.messageId,
      emoji: data.emoji,
      userId,
      username,
      displayName
    })
  })

  // Handle presence updates
  socket.on('update_status', (status: 'online' | 'away' | 'busy') => {
    const userSession = userSessions.get(socket.id)
    if (!userSession) return

    // Broadcast status to all communities the user is in
    userSession.communities.forEach(communityId => {
      socket.to(`community:${communityId}`).emit('user_status_changed', {
        userId,
        status
      })
    })
  })

  // Handle disconnection
  socket.on('disconnect', (reason) => {
    const userSession = userSessions.get(socket.id)
    if (!userSession) return

    console.log(`User disconnected: ${displayName} (${reason})`)

    // Notify all communities
    userSession.communities.forEach(communityId => {
      socket.to(`community:${communityId}`).emit('user_left', {
        userId,
        username,
        displayName
      })

      // Remove from community members
      communityMembers.get(communityId)?.delete(socket.id)
    })

    // Clean up
    userSessions.delete(socket.id)
  })
})

httpServer.listen(port, () => {
  console.log(`Socket.IO server running on port ${port}`)
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully')
  httpServer.close(() => {
    console.log('HTTP server closed')
    process.exit(0)
  })
})

export { io }