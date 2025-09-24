import mongoose from 'mongoose';

const FriendshipSchema = new mongoose.Schema({
  requester: { type: String, index: true }, // clerk user id
  recipient: { type: String, index: true },
  status: { type: String, enum: ['pending', 'accepted', 'blocked'], index: true, default: 'pending' },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
}, { collection: 'friendships' });

FriendshipSchema.index({ requester: 1, recipient: 1 }, { unique: true });

export const Friendship = mongoose.models.Friendship || mongoose.model('Friendship', FriendshipSchema);
