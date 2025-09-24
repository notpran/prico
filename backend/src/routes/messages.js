import { Router } from 'express';
import { Conversation } from '../models/Conversation.js';
import { Message } from '../models/Message.js';
import { Friendship } from '../models/Friendship.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Helper to check friendship (accepted both directions)
async function areFriends(a, b) {
  const f = await Friendship.findOne({
    $or: [
      { requester: a, recipient: b, status: 'accepted' },
      { requester: b, recipient: a, status: 'accepted' }
    ]
  });
  return !!f;
}

// Get or create a DM conversation between current user and target (friend gated)
router.post('/dm/:userId', requireAuth, async (req, res) => {
  const me = req.auth.userId;
  const other = req.params.userId;
  if (me === other) return res.status(400).json({ error: 'Cannot DM yourself' });
  if (!(await areFriends(me, other))) return res.status(403).json({ error: 'Not friends' });
  let convo = await Conversation.findOne({ participant_ids: { $all: [me, other], $size: 2 }, type: 'dm' });
  if (!convo) {
    convo = await Conversation.create({ participant_ids: [me, other], type: 'dm', created_at: new Date(), updated_at: new Date() });
  }
  res.json(convo);
});

// List conversations for current user
router.get('/conversations', requireAuth, async (req, res) => {
  const me = req.auth.userId;
  const convos = await Conversation.find({ participant_ids: me }).sort({ last_message_at: -1 }).limit(50);
  const convoIds = convos.map(c => c._id);
  const lastMessages = await Message.aggregate([
    { $match: { conversation_id: { $in: convoIds } } },
    { $sort: { created_at: -1 } },
    { $group: { _id: '$conversation_id', last: { $first: '$$ROOT' } } }
  ]);
  const lastMap = new Map(lastMessages.map(m => [String(m._id), m.last]));
  // Compute unread counts (messages newer than read_markers[me])
  const enriched = [];
  for (const c of convos) {
    const lastMsg = lastMap.get(String(c._id));
    let unread = 0;
    if (lastMsg) {
      const readAt = c.read_markers?.get ? c.read_markers.get(me) : c.read_markers?.[me];
      if (!readAt) {
        // count all messages
        unread = await Message.countDocuments({ conversation_id: c._id });
      } else {
        unread = await Message.countDocuments({ conversation_id: c._id, created_at: { $gt: readAt } });
      }
    }
    enriched.push({
      _id: c._id,
      participant_ids: c.participant_ids,
      type: c.type,
      last_message_at: c.last_message_at,
      read_markers: Object.fromEntries(c.read_markers || []),
      last_message: lastMsg || null,
      unread
    });
  }
  res.json(enriched);
});

// List messages in a conversation
router.get('/:conversationId', requireAuth, async (req, res) => {
  const me = req.auth.userId;
  const convoId = req.params.conversationId;
  const convo = await Conversation.findById(convoId);
  if (!convo || !convo.participant_ids.includes(me)) return res.status(404).json({ error: 'Not found' });
  const limit = Math.min(parseInt(req.query.limit) || 50, 200);
  const msgs = await Message.find({ conversation_id: convoId }).sort({ created_at: -1 }).limit(limit);
  res.json(msgs.reverse());
});

// Mark conversation read (updates read_markers[userId])
router.post('/:conversationId/read', requireAuth, async (req, res) => {
  const me = req.auth.userId;
  const convoId = req.params.conversationId;
  const convo = await Conversation.findById(convoId);
  if (!convo || !convo.participant_ids.includes(me)) return res.status(404).json({ error: 'Not found' });
  await Conversation.updateOne({ _id: convoId }, { $set: { [`read_markers.${me}`]: new Date(), updated_at: new Date() } });
  if (req.app.get('wss')) {
    const payload = JSON.stringify({ type: 'conversation.read', conversation_id: convoId, user_id: me, at: Date.now() });
    req.app.get('wss').clients.forEach(c => { if (c.readyState === 1 && convo.participant_ids.includes(c.userId)) c.send(payload); });
  }
  res.json({ ok: true });
});

// Send message
router.post('/:conversationId', requireAuth, async (req, res) => {
  const me = req.auth.userId;
  const convoId = req.params.conversationId;
  const convo = await Conversation.findById(convoId);
  if (!convo || !convo.participant_ids.includes(me)) return res.status(404).json({ error: 'Not found' });
  const { content } = req.body;
  if (!content || !content.trim()) return res.status(400).json({ error: 'Empty content' });
  const msg = await Message.create({ conversation_id: convo._id, sender_id: me, content: content.trim(), created_at: new Date(), updated_at: new Date() });
  await Conversation.findByIdAndUpdate(convo._id, { $set: { last_message_at: msg.created_at, updated_at: new Date() } });
  // Broadcast over websocket if available
  if (req.app.get('wss')) {
    const payload = JSON.stringify({ type: 'message.new', conversation_id: String(convo._id), message: msg });
    req.app.get('wss').clients.forEach(c => {
      if (c.readyState === 1) {
        // Filter: only participants should receive
        if (convo.participant_ids.includes(c.userId)) c.send(payload);
      }
    });
  }
  res.status(201).json(msg);
});

export default router;
