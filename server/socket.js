const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const httpServer = createServer(app);

// Configure CORS for Express
app.use(cors({
  origin: ["http://localhost:3000"],
  credentials: true
}));

// Configure Socket.IO with CORS
const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Store active users and rooms
const activeUsers = new Map();
const typingUsers = new Map();

// Middleware for Socket.IO authentication
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      console.log('No token provided');
      return next();
    }

    // In a real app, verify JWT token with Clerk here
    // For demo, we'll accept any token
    console.log('Token received:', token.substring(0, 20) + '...');
    
    socket.userId = socket.handshake.auth.userId || 'demo-user';
    socket.userName = socket.handshake.auth.userName || 'Demo User';
    
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    next();
  }
});

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.userName || 'Anonymous'} (${socket.id})`);

  // Store user info
  if (socket.userId) {
    activeUsers.set(socket.id, {
      userId: socket.userId,
      userName: socket.userName,
      socketId: socket.id
    });
  }

  // Join community rooms
  socket.on('join-community', (communityId) => {
    socket.join(`community-${communityId}`);
    console.log(`${socket.userName} joined community: ${communityId}`);
    
    // Notify others in the community
    socket.to(`community-${communityId}`).emit('user-joined', {
      userId: socket.userId,
      userName: socket.userName,
      timestamp: new Date().toISOString()
    });
  });

  // Join channel rooms
  socket.on('join-channel', ({ communityId, channelId }) => {
    const roomId = `${communityId}-${channelId}`;
    socket.join(roomId);
    console.log(`${socket.userName} joined channel: ${channelId} in community: ${communityId}`);
    
    // Send recent messages (in a real app, fetch from database)
    const recentMessages = [
      {
        id: 'msg-1',
        content: 'Welcome to the channel! 👋',
        userId: 'system',
        userName: 'System',
        timestamp: new Date(Date.now() - 60000).toISOString(),
        avatar: null
      },
      {
        id: 'msg-2',
        content: 'This is a demo message to show how real-time chat works.',
        userId: 'demo-user-2',
        userName: 'Demo User 2',
        timestamp: new Date(Date.now() - 30000).toISOString(),
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo2'
      }
    ];

    socket.emit('channel-history', { channelId, messages: recentMessages });
  });

  // Handle new messages
  socket.on('send-message', (data) => {
    const { communityId, channelId, content } = data;
    const roomId = `${communityId}-${channelId}`;
    
    const message = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      content,
      userId: socket.userId,
      userName: socket.userName,
      timestamp: new Date().toISOString(),
      avatar: data.avatar || null
    };

    console.log(`Message from ${socket.userName} in ${roomId}:`, content);

    // Broadcast to all users in the channel
    io.to(roomId).emit('new-message', message);
  });

  // Handle typing indicators
  socket.on('typing-start', ({ communityId, channelId }) => {
    const roomId = `${communityId}-${channelId}`;
    const typingKey = `${roomId}-${socket.userId}`;
    
    // Add user to typing list
    typingUsers.set(typingKey, {
      userId: socket.userId,
      userName: socket.userName,
      timestamp: Date.now()
    });

    // Broadcast typing indicator to others in the channel
    socket.to(roomId).emit('user-typing', {
      userId: socket.userId,
      userName: socket.userName,
      isTyping: true
    });

    // Auto-clear typing after 5 seconds
    setTimeout(() => {
      if (typingUsers.has(typingKey)) {
        typingUsers.delete(typingKey);
        socket.to(roomId).emit('user-typing', {
          userId: socket.userId,
          userName: socket.userName,
          isTyping: false
        });
      }
    }, 5000);
  });

  socket.on('typing-stop', ({ communityId, channelId }) => {
    const roomId = `${communityId}-${channelId}`;
    const typingKey = `${roomId}-${socket.userId}`;
    
    typingUsers.delete(typingKey);
    
    socket.to(roomId).emit('user-typing', {
      userId: socket.userId,
      userName: socket.userName,
      isTyping: false
    });
  });

  // Handle message reactions
  socket.on('add-reaction', ({ messageId, emoji, communityId, channelId }) => {
    const roomId = `${communityId}-${channelId}`;
    
    const reaction = {
      messageId,
      emoji,
      userId: socket.userId,
      userName: socket.userName,
      timestamp: new Date().toISOString()
    };

    console.log(`Reaction ${emoji} added to message ${messageId} by ${socket.userName}`);

    // Broadcast reaction to all users in the channel
    io.to(roomId).emit('message-reaction', reaction);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.userName || 'Anonymous'} (${socket.id})`);
    
    // Clean up user data
    activeUsers.delete(socket.id);
    
    // Clean up typing indicators
    for (const [key, value] of typingUsers.entries()) {
      if (value.userId === socket.userId) {
        typingUsers.delete(key);
      }
    }

    // Notify communities about user leaving
    socket.rooms.forEach(room => {
      if (room.startsWith('community-')) {
        socket.to(room).emit('user-left', {
          userId: socket.userId,
          userName: socket.userName,
          timestamp: new Date().toISOString()
        });
      }
    });
  });
});

const PORT = process.env.SOCKET_PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`🚀 Socket.IO server running on port ${PORT}`);
  console.log(`📡 CORS enabled for: http://localhost:3000`);
  console.log(`🔗 Socket.IO endpoint: http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  httpServer.close(() => {
    console.log('Socket.IO server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  httpServer.close(() => {
    console.log('Socket.IO server closed');
    process.exit(0);
  });
});