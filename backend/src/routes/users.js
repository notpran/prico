import { Router } from 'express';
import { User } from '../models/User.js';

const router = Router();

// Create user
router.post('/', async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.status(201).json(user);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// List users (paginated)
router.get('/', async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 25, 100);
  const skip = parseInt(req.query.skip) || 0;
  const users = await User.find().sort({ createdAt: -1 }).skip(skip).limit(limit);
  res.json(users);
});

// Search users (query param variant)
router.get('/search', async (req, res) => {
  const q = (req.query.q || '').trim();
  if (!q) return res.json([]);
  const users = await User.find({ $or: [
    { username: new RegExp(q, 'i') },
    { email: new RegExp(q, 'i') },
    { full_name: new RegExp(q, 'i') }
  ]}).limit(25);
  res.json(users);
});

// Bulk lookup by clerk ids: /users/bulk/by-clerk?ids=a,b,c
router.get('/bulk/by-clerk', async (req, res) => {
  const idsParam = (req.query.ids || '').trim();
  if (!idsParam) return res.json([]);
  const ids = idsParam.split(',').map(s => s.trim()).filter(Boolean);
  if (ids.length === 0) return res.json([]);
  const users = await User.find({ clerk_id: { $in: ids } }).select('clerk_id username full_name avatar_url');
  res.json(users);
});

// Search users (path param variant) - kept for backwards compatibility
router.get('/search/:q', async (req, res) => {
  const q = req.params.q;
  const users = await User.find({ $or: [
    { username: new RegExp(q, 'i') },
    { email: new RegExp(q, 'i') },
    { full_name: new RegExp(q, 'i') }
  ]}).limit(25);
  res.json(users);
});

// Get user by ID (placed after search routes to avoid conflicts)
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'Not found' });
    res.json(user);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Get user by email
router.get('/by/email/:email', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });
    if (!user) return res.status(404).json({ error: 'Not found' });
    res.json(user);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Get user by username
router.get('/by/username/:username', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) return res.status(404).json({ error: 'Not found' });
    res.json(user);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});


// Update user
router.patch('/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!user) return res.status(404).json({ error: 'Not found' });
    res.json(user);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

export default router;
