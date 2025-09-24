import express from 'express';
import cors from 'cors';
import { PORT } from './config.js';
import { connectDB, getDbStatus } from './db.js';
import { requireAuth } from './middleware/auth.js';
import usersRouter from './routes/users.js';
import syncRouter from './routes/sync.js';

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

app.get('/debug/db', requireAuth, (_req, res) => {
  res.json(getDbStatus());
});

app.listen(PORT, () => console.log(`[Server] Listening on ${PORT} (initializing DB...)`));
// Fire and forget DB connection with retries
connectDB();
