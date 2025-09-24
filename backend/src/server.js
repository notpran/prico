import express from 'express';
import cors from 'cors';
import { PORT } from './config.js';
import { connectDB, getDbStatus } from './db.js';
import { requireAuth } from './middleware/auth.js';
import usersRouter from './routes/users.js';
import syncRouter from './routes/sync.js';
import friendsRouter from './routes/friends.js';
import messagesRouter from './routes/messages.js';
import http from 'http';
import { WebSocketServer } from 'ws';
import { verifyClerkToken } from './lib/clerkAuth.js';

const app = express();
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());

app.get('/', (_req, res) => res.json({ message: 'Prico API (Node)', version: '0.1.0' }));
app.get('/health', (_req, res) => {
  const db = getDbStatus();
  res.json({ status: 'ok', version: '0.1.0', db });
});

app.use('/users', usersRouter);
app.use('/sync', syncRouter);
app.use('/friends', friendsRouter);
app.use('/messages', messagesRouter);

app.get('/debug/db', requireAuth, (_req, res) => {
  res.json(getDbStatus());
});

const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });
app.set('wss', wss);
const presence = new Map(); // userId -> { lastSeen, sockets: Set }

// Auth on connect: supports ?token= or Authorization header forwarded by proxy
wss.on('connection', async (socket, req) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    let token = url.searchParams.get('token');
    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.substring(7);
    }
    if (!token) {
      socket.send(JSON.stringify({ type: 'error', error: 'Missing token' }));
      socket.close();
      return;
    }
    const payload = await verifyClerkToken(token);
    socket.userId = payload.sub;
    if (!presence.has(socket.userId)) presence.set(socket.userId, { lastSeen: Date.now(), sockets: new Set() });
    presence.get(socket.userId).sockets.add(socket);
    presence.get(socket.userId).lastSeen = Date.now();
    socket.send(JSON.stringify({ type: 'hello', userId: socket.userId, time: Date.now() }));
    socket.on('message', (data) => {
      let msg;
      try { msg = JSON.parse(data.toString()); } catch { return; }
      if (msg.type === 'ping') socket.send(JSON.stringify({ type: 'pong', t: Date.now() }));
      if (msg.type === 'typing' && msg.conversation_id) {
        // Broadcast typing to other participants (simple fan-out)
        const out = JSON.stringify({ type: 'typing', conversation_id: msg.conversation_id, user_id: socket.userId, at: Date.now() });
        wss.clients.forEach(c => { if (c !== socket && c.readyState === 1) c.send(out); });
      }
    });
    socket.on('close', () => {
      const entry = presence.get(socket.userId);
      if (entry) {
        entry.sockets.delete(socket);
        entry.lastSeen = Date.now();
        if (entry.sockets.size === 0) {
          // Broadcast offline
          const off = JSON.stringify({ type: 'presence', user_id: socket.userId, status: 'offline', at: Date.now() });
            wss.clients.forEach(c => { if (c.readyState === 1) c.send(off); });
        }
      }
    });
    // Broadcast online presence
    const on = JSON.stringify({ type: 'presence', user_id: socket.userId, status: 'online', at: Date.now() });
    wss.clients.forEach(c => { if (c.readyState === 1) c.send(on); });
  } catch (e) {
    socket.send(JSON.stringify({ type: 'error', error: 'Auth failed', detail: e.message }));
    socket.close();
  }
});

server.listen(PORT, () => console.log(`[Server] Listening on ${PORT} (initializing DB...)`));
connectDB();
