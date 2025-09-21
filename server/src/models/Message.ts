import { Schema, model, Types } from 'mongoose';

const messageSchema = new Schema({
  senderId: { type: Types.ObjectId, ref: 'User', required: true },
  communityId: { type: Types.ObjectId, ref: 'Community', required: true },
  text: { type: String, required: true },
  attachments: [{ type: String }], // URLs to attachments
  createdAt: { type: Date, default: Date.now },
});

export const Message = model('Message', messageSchema);
