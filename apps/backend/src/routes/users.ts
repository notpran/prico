import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { UserModel } from '../db/models';
import { signInternalToken } from '../services/jwt';

export const usersRouter = Router();

// Get or create current user record; return internal JWT for websocket usage
usersRouter.post('/me', requireAuth, async (req, res) => {
  const auth = (req as any).auth as { userId: string; sessionId: string };
  const { userId, sessionId } = auth;
  const { username, email, displayName, age } = req.body || {};
  if (!username || !email || !age) {
    return res.status(400).json({ error: 'username, email, age required' });
  }
  const update = { username, email, displayName, age };
  const user = await UserModel.findOneAndUpdate({ _id: userId }, update, {
    new: true,
    upsert: true,
    setDefaultsOnInsert: true
  });
  const internalJwt = signInternalToken({ sub: userId, sid: sessionId });
  res.json({ user, internalJwt });
});

usersRouter.get('/me', requireAuth, async (req, res) => {
  const auth = (req as any).auth as { userId: string };
  const user = await UserModel.findById(auth.userId);
  res.json({ user });
});
