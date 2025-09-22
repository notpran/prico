import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { verifySession } from '@clerk/clerk-sdk-node';
import { connectToDatabase } from '../../web/src/lib/mongo'; // Adjust path

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

// Auth middleware for socket
io.use(async (socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error('No token'));

  try {
    const session = await verifySession(token);
    socket.data.userId = session.userId;
    next();
  } catch (err) {
    next(new Error('Invalid token'));
  }
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.data.userId);

  // Join channel
  socket.on('join_channel', (channelId: string) => {
    socket.join(`channel:${channelId}`);
    console.log(`User ${socket.data.userId} joined channel ${channelId}`);
  });

  // Leave channel
  socket.on('leave_channel', (channelId: string) => {
    socket.leave(`channel:${channelId}`);
  });

  // Send message
  socket.on('send_message', async (data: { channelId: string; tempId: string; content: string }) => {
    const { channelId, tempId, content } = data;
    const userId = socket.data.userId;

    // Save to DB
    const db = await connectToDatabase();
    const messages = db.collection('messages');

    const newMessage = {
      channelId,
      authorId: userId,
      content,
      createdAt: new Date(),
    };

    const result = await messages.insertOne(newMessage);

    // Emit to room
    io.to(`channel:${channelId}`).emit('message_created', {
      message: { ...newMessage, _id: result.insertedId },
      tempId,
    });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.data.userId);
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Socket server running on port ${PORT}`);
});