import { Router } from 'express';
import { Friendship } from '../models/Friendship.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Send friend request
router.post('/request/:userId', requireAuth, async (req, res) => {
  const requester = req.auth.userId;
  const recipient = req.params.userId;
  if (requester === recipient) return res.status(400).json({ error: 'Cannot friend yourself' });
  try {
    const doc = await Friendship.findOneAndUpdate(
      { requester, recipient },
      { $setOnInsert: { status: 'pending', created_at: new Date(), updated_at: new Date() } },
      { upsert: true, new: true }
    );
    res.json(doc);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Accept friend request (recipient accepts)
router.post('/accept/:userId', requireAuth, async (req, res) => {
  const recipient = req.auth.userId;
  const requester = req.params.userId;
  const fr = await Friendship.findOneAndUpdate(
    { requester, recipient, status: 'pending' },
    { $set: { status: 'accepted', updated_at: new Date() } },
    { new: true }
  );
  if (!fr) return res.status(404).json({ error: 'Request not found' });
  res.json(fr);
});

// Decline (delete) friend request
router.post('/decline/:userId', requireAuth, async (req, res) => {
  const recipient = req.auth.userId;
  const requester = req.params.userId;
  const fr = await Friendship.findOneAndDelete({ requester, recipient, status: 'pending' });
  if (!fr) return res.status(404).json({ error: 'Request not found' });
  res.json({ declined: true });
});

// List friends
router.get('/list', requireAuth, async (req, res) => {
  const userId = req.auth.userId;
  const friends = await Friendship.find({ $or: [ { requester: userId }, { recipient: userId } ], status: 'accepted' });
  const mapped = friends.map(f => ({
    friendId: f.requester === userId ? f.recipient : f.requester,
    since: f.updated_at
  }));
  res.json(mapped);
});

// Pending incoming
router.get('/incoming', requireAuth, async (req, res) => {
  const userId = req.auth.userId;
  const pending = await Friendship.find({ recipient: userId, status: 'pending' });
  res.json(pending);
});

// Pending outgoing
router.get('/outgoing', requireAuth, async (req, res) => {
  const userId = req.auth.userId;
  const pending = await Friendship.find({ requester: userId, status: 'pending' });
  res.json(pending);
});

export default router;
