import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import { verifyInternalToken } from './services/jwt';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';
import { env, assertEnv } from './config/env';
import { initMongo } from './db/connection';
import { healthRouter } from './routes/health';
import { usersRouter } from './routes/users';
import { communitiesRouter } from './routes/communities';
import { projectsRouter } from './routes/projects';
import { clerkMiddleware } from '@clerk/express';
import { apiLimiter } from './middleware/rateLimit';

async function bootstrap() {
  assertEnv();
  if (env.ALLOW_START_WITHOUT_DB) {
    console.warn('[server] Starting without DB connection (ALLOW_START_WITHOUT_DB=1)');
  } else {
    await initMongo();
  }

  const app = express();
  const server = http.createServer(app);
  const io = new Server(server, {
    cors: {
      origin: '*',
    },
  });

  app.use(helmet());
  app.use(clerkMiddleware());
  app.use(cors());
  app.use(express.json({ limit: '1mb' }));
  app.use(morgan('dev'));

  app.use('/api', apiLimiter, healthRouter);
  app.use('/api/users', apiLimiter, usersRouter);
  app.use('/api/communities', apiLimiter, communitiesRouter);
  app.use('/api/projects', apiLimiter, projectsRouter);

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token as string | undefined;
    if (!token) return next(new Error('Missing token'));
    const payload = verifyInternalToken(token);
    if (!payload) return next(new Error('Invalid token'));
    (socket as any).user = payload;
    next();
  });

  io.on('connection', (socket) => {
    const user = (socket as any).user;
    console.log('[socket] connected', socket.id, user?.sub);
    socket.emit('auth:ack', { userId: user?.sub });
    socket.emit('notification:new', {
      id: socket.id + ':' + Date.now(),
      title: 'Welcome',
      body: 'You are now connected to Prico realtime.',
      ts: Date.now()
    });
    socket.on('disconnect', () => console.log('[socket] disconnected', socket.id));
  });

  // Basic community chat events
  const chat = io.of('/chat');
  chat.use((socket, next) => {
    const token = socket.handshake.auth?.token as string | undefined;
    const payload = token ? verifyInternalToken(token) : null;
    if (!payload) return next(new Error('Invalid token'));
    (socket as any).user = payload;
    next();
  });
  chat.on('connection', (socket) => {
    socket.on('channel:join', (roomId: string) => {
      socket.join(roomId);
    });
    socket.on('message:new', async (payload: { channelId: string; content: string }) => {
      const user = (socket as any).user;
      const msg = { id: socket.id + ':' + Date.now(), senderId: user?.sub, content: payload.content, createdAt: new Date() };
      chat.to(payload.channelId).emit('message:new', msg);
      // Try to persist when DB is available (best-effort)
      try {
        const { MessageModel } = await import('./db/models');
        await MessageModel.create({ senderId: user?.sub, channelId: payload.channelId, content: payload.content });
      } catch (e) {
        // no-op if DB not connected or write fails
      }
    });

    // Typing indicators
    socket.on('typing', (payload: { channelId: string }) => {
      const user = (socket as any).user;
      if (!payload?.channelId) return;
      socket.to(payload.channelId).emit('typing', { userId: user?.sub, channelId: payload.channelId });
    });
    socket.on('stop_typing', (payload: { channelId: string }) => {
      const user = (socket as any).user;
      if (!payload?.channelId) return;
      socket.to(payload.channelId).emit('stop_typing', { userId: user?.sub, channelId: payload.channelId });
    });
  });

  server.listen(env.PORT, () => {
    console.log(`[server] listening on :${env.PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error('Fatal bootstrap error', err);
  process.exit(1);
});
