import mongoose from 'mongoose';

const ConversationSchema = new mongoose.Schema({
  participant_ids: { type: [String], index: true }, // array of clerk user ids
  type: { type: String, enum: ['dm', 'group'], default: 'dm' },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  last_message_at: { type: Date },
  read_markers: { type: Map, of: Date, default: {} }
}, { collection: 'conversations' });

ConversationSchema.index({ participant_ids: 1 });
ConversationSchema.index({ last_message_at: -1 });
ConversationSchema.index({ participant_ids: 1, type: 1 });

export const Conversation = mongoose.models.Conversation || mongoose.model('Conversation', ConversationSchema);
