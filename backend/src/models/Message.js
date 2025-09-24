import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
  conversation_id: { type: mongoose.Schema.Types.ObjectId, index: true, ref: 'Conversation' },
  sender_id: { type: String, index: true }, // clerk user id
  content: { type: String },
  kind: { type: String, enum: ['text', 'system'], default: 'text' },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
}, { collection: 'messages' });

MessageSchema.index({ conversation_id: 1, created_at: 1 });

export const Message = mongoose.models.Message || mongoose.model('Message', MessageSchema);
