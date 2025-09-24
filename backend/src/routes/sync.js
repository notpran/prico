import { Router } from 'express';
import axios from 'axios';
import { CLERK_SECRET_KEY } from '../config.js';
import { User } from '../models/User.js';
import mongoose from 'mongoose';
import { waitForDb, isDbConnected, ensureDbConnected } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.post('/clerk', requireAuth, async (req, res) => {
  if (!CLERK_SECRET_KEY) return res.status(500).json({ error: 'CLERK_SECRET_KEY not set' });
  try {
    const ensured = await ensureDbConnected({ waitTimeoutMs: 10000 });
    if (!ensured) {
      return res.status(503).json({ error: 'DB not connected' });
    }
    const ns = User.collection?.namespace; // expected: <db>.users
    console.log('[sync] User collection namespace:', ns);
    if (typeof ns === 'string') {
      // Defensive: detect malformed namespace containing '/.users'
      if (/\/\.users$/.test(ns)) {
        console.warn('[sync] Detected malformed namespace pattern, attempting to create collection explicitly');
        try {
          await mongoose.connection.db.createCollection('users');
          console.log('[sync] createCollection("users") executed');
        } catch (ce) {
          console.warn('[sync] createCollection attempt warning:', ce.message);
        }
        return res.status(500).json({ error: 'Malformed namespace detected', namespace: ns });
      }
    }
    const resp = await axios.get('https://api.clerk.dev/v1/users', {
      headers: { Authorization: `Bearer ${CLERK_SECRET_KEY}` }
    });
    const clerkUsers = resp.data;
    if (!Array.isArray(clerkUsers)) {
      return res.status(500).json({ error: 'Unexpected Clerk response format' });
    }
    console.log(`[sync] Fetched ${clerkUsers.length} Clerk users`);
    let synced = 0;
    for (const cu of clerkUsers) {
      const first = cu.first_name || '';
      const last = cu.last_name || '';
      const username = cu.username || (first + last) || cu.id;
      const email = cu.email_addresses?.[0]?.email_address;
      const full_name = (first + ' ' + last).trim() || username;
      if (synced === 0) {
        console.log('[sync] Sample user object:', {
          clerk_id: cu.id,
          username,
          email,
          full_name
        });
      }
      await User.updateOne(
        { clerk_id: cu.id },
        {
          $set: {
            username,
            email,
            full_name,
            bio: null,
            avatar_url: cu.image_url,
            communities: [],
            friends: [],
            friend_requests_sent: [],
            friend_requests_received: [],
            created_at: cu.created_at ? new Date(cu.created_at) : undefined,
            updated_at: cu.updated_at ? new Date(cu.updated_at) : undefined
          },
          $setOnInsert: { clerk_id: cu.id }
        },
        { upsert: true }
      );
      synced++;
    }
    res.json({ synced });
  } catch (e) {
    console.error('Clerk sync error', e.response?.data || e.message);
    res.status(500).json({ error: 'Clerk sync failed', detail: e.response?.data || e.message });
  }
});

export default router;
