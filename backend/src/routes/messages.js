import { Router } from 'express';
import { Conversation } from '../models/Conversation.js';
import { Message } from '../models/Message.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Get or create a DM conversation between current user and target
router.post('/dm/:userId', requireAuth, async (req, res) => {
  const me = req.auth.userId;
  const other = req.params.userId;
  if (me === other) return res.status(400).json({ error: 'Cannot DM yourself' });
  let convo = await Conversation.findOne({ participant_ids: { $all: [me, other], $size: 2 }, type: 'dm' });
  if (!convo) {
    convo = await Conversation.create({ participant_ids: [me, other], type: 'dm', created_at: new Date(), updated_at: new Date() });
  }
  res.json(convo);
});

// List conversations for current user
router.get('/conversations', requireAuth, async (req, res) => {
  const me = req.auth.userId;
  const list = await Conversation.find({ participant_ids: me }).sort({ last_message_at: -1 }).limit(50);
  res.json(list);
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
  res.status(201).json(msg);
});

export default router;
