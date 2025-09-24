import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  clerk_id: { type: String, index: true, unique: true },
  username: { type: String, index: true },
  email: { type: String, index: true },
  full_name: String,
  bio: String,
  avatar_url: String,
  communities: [String],
  friends: [String],
  friend_requests_sent: [String],
  friend_requests_received: [String],
  created_at: Date,
  updated_at: Date
}, { timestamps: true, collection: 'users' });

export const User = mongoose.model('User', UserSchema, 'users');
