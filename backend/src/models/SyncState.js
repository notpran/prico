import mongoose from 'mongoose';

const SyncStateSchema = new mongoose.Schema({
  key: { type: String, unique: true, index: true },
  last_clerk_sync: { type: Date },
  meta: { type: Object }
}, { collection: 'sync_state', timestamps: true });

export const SyncState = mongoose.models.SyncState || mongoose.model('SyncState', SyncStateSchema);
