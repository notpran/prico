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
// Simple in-memory cache for conversation participants to scope typing events
const conversationCache = new Map(); // convoId -> { participants: string[], expires: number }
const CONVO_CACHE_TTL_MS = 60_000;

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
    socket.on('message', async (data) => {
      let msg;
      try { msg = JSON.parse(data.toString()); } catch { return; }
      if (msg.type === 'ping') socket.send(JSON.stringify({ type: 'pong', t: Date.now() }));
      if (msg.type === 'typing' && msg.conversation_id) {
        const convoId = msg.conversation_id;
        const now = Date.now();
        let cached = conversationCache.get(convoId);
        if (!cached || cached.expires < now) {
          try {
            const { Conversation } = await import('./models/Conversation.js');
            const convo = await Conversation.findById(convoId).select('participant_ids');
            if (!convo) return; // invalid conversation
            cached = { participants: convo.participant_ids, expires: now + CONVO_CACHE_TTL_MS };
            conversationCache.set(convoId, cached);
          } catch {
            return;
          }
        }
        if (!cached.participants.includes(socket.userId)) return; // sender not in convo
        const out = JSON.stringify({ type: 'typing', conversation_id: convoId, user_id: socket.userId, at: now });
        wss.clients.forEach(c => { if (c !== socket && c.readyState === 1 && cached.participants.includes(c.userId)) c.send(out); });
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

// Heartbeat: periodically broadcast presence for connected users & purge stale caches
setInterval(() => {
  const now = Date.now();
  // Cleanup conversation cache
  for (const [k, v] of conversationCache.entries()) {
    if (v.expires < now) conversationCache.delete(k);
  }
  // Broadcast online heartbeat (optional) so clients can update last seen
  const payloads = [];
  for (const [userId, entry] of presence.entries()) {
    if (entry.sockets.size > 0) {
      payloads.push(JSON.stringify({ type: 'presence', user_id: userId, status: 'online', at: now }));
    }
  }
  if (payloads.length) {
    wss.clients.forEach(c => {
      if (c.readyState === 1) payloads.forEach(p => c.send(p));
    });
  }
}, 30_000);

server.listen(PORT, () => console.log(`[Server] Listening on ${PORT} (initializing DB...)`));
connectDB();
