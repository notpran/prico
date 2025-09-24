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

// Simple auth on connect (expects ?token=)
wss.on('connection', (socket, req) => {
  const url = new URL(req.url, 'http://localhost');
  const token = url.searchParams.get('token');
  socket.authToken = token;
  socket.send(JSON.stringify({ type: 'hello', time: Date.now() }));
  socket.on('message', (data) => {
    let msg;
    try { msg = JSON.parse(data.toString()); } catch { return; }
    if (msg.type === 'ping') socket.send(JSON.stringify({ type: 'pong', t: Date.now() }));
  });
});

server.listen(PORT, () => console.log(`[Server] Listening on ${PORT} (initializing DB...)`));
connectDB();
