import express from 'express';
import http from 'http';
import { Server, Socket } from 'socket.io';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import authRoutes from './routes/api/auth';
import communityRoutes from './routes/api/communities';
import uploadRoutes from './routes/api/upload';
import documentRoutes from './routes/api/documents';
import runRoutes from './routes/api/runs';
import gitRoutes from './routes/api/git';
import setupYjs from './yjs-server';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // In production, restrict this to your frontend's domain
    methods: ['GET', 'POST'],
  },
});

const ysocketio = new YSocketIO(io);
ysocketio.initialize();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', authRoutes);
app.use('/api', communityRoutes);
app.use('/api', uploadRoutes);
app.use('/api', documentRoutes);
app.use('/api', runRoutes);
app.use('/api', gitRoutes);

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static('uploads'));

app.get('/', (req, res) => {
  res.send('<h1>Prico Server</h1>');
});

interface SocketWithAuth extends Socket {
    userId?: string;
}

// Socket.IO Auth Middleware
io.use((socket: SocketWithAuth, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
        return next(new Error('Authentication error'));
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
        socket.userId = decoded.userId;
        next();
    } catch (err) {
        next(new Error('Authentication error'));
    }
});

// Socket.IO
io.on('connection', (socket: SocketWithAuth) => {
  console.log('a user connected:', socket.userId);

  socket.on('join_community', (communityId: string) => {
    socket.join(`community:${communityId}`);
    console.log(`User ${socket.userId} joined community ${communityId}`);
  });

  socket.on('leave_community', (communityId: string) => {
    socket.leave(`community:${communityId}`);
    console.log(`User ${socket.userId} left community ${communityId}`);
  });

  socket.on('community_message', async ({ communityId, text, attachments }) => {
    if (!socket.userId) return;

    const message = new Message({
        communityId,
        text,
        senderId: socket.userId,
        attachments,
    });
    await message.save();

    const sender = await User.findById(socket.userId).select('displayName');

    io.to(`community:${communityId}`).emit('new_message', {
        ...message.toObject(),
        senderId: {
            _id: sender?._id,
            displayName: sender?.displayName,
        }
    });
  });

  // WebRTC signaling events
  socket.on('webrtc:join-call', (data: { communityId: string }) => {
    socket.join(`call:${data.communityId}`);
    socket.to(`call:${data.communityId}`).emit('webrtc:user-joined', { userId: socket.userId });
    console.log(`User ${socket.userId} joined call in community ${data.communityId}`);
  });

  socket.on('webrtc:leave-call', (data: { communityId: string }) => {
    socket.leave(`call:${data.communityId}`);
    socket.to(`call:${data.communityId}`).emit('webrtc:user-left', { userId: socket.userId });
    console.log(`User ${socket.userId} left call in community ${data.communityId}`);
  });

  socket.on('webrtc:offer', (data: { to: string, offer: any, communityId: string }) => {
    socket.to(`call:${data.communityId}`).emit('webrtc:offer', {
      from: socket.userId,
      offer: data.offer
    });
  });

  socket.on('webrtc:answer', (data: { to: string, answer: any, communityId: string }) => {
    socket.to(`call:${data.communityId}`).emit('webrtc:answer', {
      from: socket.userId,
      answer: data.answer
    });
  });

  socket.on('webrtc:ice-candidate', (data: { to: string, candidate: any, communityId: string }) => {
    socket.to(`call:${data.communityId}`).emit('webrtc:ice-candidate', {
      from: socket.userId,
      candidate: data.candidate
    });
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

const PORT = process.env.PORT || 3001;

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI!)
  .then(() => {
    console.log('Connected to MongoDB');
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      setupYjs(server);
    });
  })
  .catch(err => {
    console.error('Could not connect to MongoDB', err);
    process.exit(1);
  });
