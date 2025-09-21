import { Schema, model, Types } from 'mongoose';

const documentSchema = new Schema({
  name: { type: String, required: true },
  communityId: { type: Types.ObjectId, ref: 'Community', required: true },
  ownerId: { type: Types.ObjectId, ref: 'User', required: true },
  content: { type: String, default: '' }, // This will store the Yjs document data
  createdAt: { type: Date, default: Date.now },
});

export const Document = model('Document', documentSchema);
