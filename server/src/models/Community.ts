import { Schema, model, Types } from 'mongoose';

const communitySchema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  ownerId: { type: Types.ObjectId, ref: 'User', required: true },
  members: [{ type: Types.ObjectId, ref: 'User' }],
  // In a real app, roles would be more complex
  roles: {
    admins: [{ type: Types.ObjectId, ref: 'User' }],
  },
  privacy: { type: String, enum: ['public', 'private'], default: 'public' },
  createdAt: { type: Date, default: Date.now },
});

export const Community = model('Community', communitySchema);
