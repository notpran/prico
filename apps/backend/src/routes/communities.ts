import { Router } from 'express';
import { CommunityModel, MessageModel, UserModel } from '../db/models';
import { requireAuth } from '../middleware/auth';

export const communitiesRouter = Router();

communitiesRouter.get('/', async (_req, res) => {
  try {
    const docs = await CommunityModel.find().limit(25).lean();
    const items = docs.map((d) => ({
      _id: String(d._id),
      name: d.name,
      description: d.description,
      members: d.members?.length ?? 0
    }));
    res.json({ items });
  } catch {
    // If DB not available, return empty list gracefully for UI demo
    res.json({ items: [] });
  }
});

// Get single community details
communitiesRouter.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const doc = await CommunityModel.findById(id).lean();
    if (!doc) return res.status(404).json({ error: 'not_found' });
    res.json({
      _id: String(doc._id),
      name: doc.name,
      description: doc.description,
      visibility: doc.visibility,
      channels: (doc.channels || []).map((c: any) => ({ channelId: String(c.channelId), name: c.name, type: c.type })),
      membersCount: doc.members?.length ?? 0
    });
  } catch {
    res.status(200).json({ _id: id, name: `Community ${id}`, description: 'Demo', visibility: 'public', channels: [{ channelId: 'general', name: 'general', type: 'text' }], membersCount: 1 });
  }
});

// Join community
communitiesRouter.post('/:id/join', requireAuth, async (req: any, res) => {
  const { id } = req.params; const userId = req.auth.userId;
  try {
    await CommunityModel.findByIdAndUpdate(id, { $addToSet: { members: userId, roles: { userId, role: 'member' } } });
    await UserModel.findByIdAndUpdate(userId, { $addToSet: { communities: id } });
    res.json({ ok: true });
  } catch {
    res.json({ ok: true });
  }
});

// Leave community
communitiesRouter.post('/:id/leave', requireAuth, async (req: any, res) => {
  const { id } = req.params; const userId = req.auth.userId;
  try {
    await CommunityModel.findByIdAndUpdate(id, { $pull: { members: userId, roles: { userId } } });
    await UserModel.findByIdAndUpdate(userId, { $pull: { communities: id } });
    res.json({ ok: true });
  } catch {
    res.json({ ok: true });
  }
});

// Fetch channel messages (history)
communitiesRouter.get('/:id/channels/:channelId/messages', async (req, res) => {
  const { id, channelId } = req.params;
  try {
    const docs = await MessageModel.find({ channelId }).sort({ createdAt: -1 }).limit(50).lean();
    const items = docs.reverse().map((m: any) => ({ id: String(m._id), senderId: String(m.senderId), content: m.content, createdAt: m.createdAt }));
    res.json({ items });
  } catch {
    res.json({ items: [] });
  }
});

communitiesRouter.post('/', requireAuth, async (req: any, res) => {
  const { name, description, visibility } = req.body || {};
  if (!name || typeof name !== 'string') return res.status(400).json({ error: 'name_required' });
  const ownerId = req.auth.userId;
  try {
    const doc = await CommunityModel.create({
      name,
      description,
      visibility: visibility === 'private' ? 'private' : 'public',
      ownerId,
      roles: [{ userId: ownerId, role: 'owner' }],
      members: [ownerId],
      channels: [{ name: 'general', type: 'text' }]
    });
    // link to user
    await UserModel.findByIdAndUpdate(ownerId, { $addToSet: { communities: doc._id } }).catch(() => {});
    res.status(201).json({ id: String(doc._id) });
  } catch (e) {
    // demo fallback when DB is unavailable
    res.status(201).json({ id: 'demo-' + Date.now() });
  }
});
