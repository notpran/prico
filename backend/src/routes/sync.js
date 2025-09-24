import { Router } from 'express';
import axios from 'axios';
import { CLERK_SECRET_KEY } from '../config.js';
import { User } from '../models/User.js';
import { SyncState } from '../models/SyncState.js';
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
    // Incremental: fetch last sync time
    const state = await SyncState.findOne({ key: 'clerk' });
    const since = state?.last_clerk_sync;
    let url = 'https://api.clerk.dev/v1/users?limit=100';
    if (since) {
      // Clerk does not officially document updated_after param publicly for all plans; using updated_at filter fallback if available
      // If unsupported, full sync occurs; adjust as needed.
      const iso = encodeURIComponent(since.toISOString());
      url += `&updated_after=${iso}`;
    }
    let totalFetched = 0;
    let totalUpserted = 0;
    let page = 1;
    let lastUpdatedSeen = since || new Date(0);
    const headers = { Authorization: `Bearer ${CLERK_SECRET_KEY}` };
    while (url) {
      const resp = await axios.get(url, { headers });
      const data = resp.data;
      let items = data;
      let nextUrl = null;
      // Handle both array (legacy) and object+pagination shapes
      if (Array.isArray(data)) {
        items = data;
      } else if (data && Array.isArray(data.data)) {
        items = data.data;
        nextUrl = data?.pagination?.next_url;
      }
      console.log(`[sync] Page ${page} fetched ${items.length}`);
      for (const cu of items) {
      const first = cu.first_name || '';
      const last = cu.last_name || '';
      const username = cu.username || (first + last) || cu.id;
      const email = cu.email_addresses?.[0]?.email_address;
      const full_name = (first + ' ' + last).trim() || username;
        if (totalUpserted === 0) {
          console.log('[sync] Sample user object:', { clerk_id: cu.id, username, email, full_name });
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
        totalUpserted++;
        if (cu.updated_at) {
          const upd = new Date(cu.updated_at);
          if (upd > lastUpdatedSeen) lastUpdatedSeen = upd;
        }
      }
      totalFetched += items.length;
      if (nextUrl) {
        url = nextUrl;
        page++;
      } else {
        url = null;
      }
    }
    await SyncState.updateOne(
      { key: 'clerk' },
      { $set: { last_clerk_sync: lastUpdatedSeen, meta: { totalFetched, totalUpserted, completedAt: new Date() } } },
      { upsert: true }
    );
    res.json({ fetched: totalFetched, upserted: totalUpserted, lastUpdatedSeen });
  } catch (e) {
    console.error('Clerk sync error', e.response?.data || e.message);
    res.status(500).json({ error: 'Clerk sync failed', detail: e.response?.data || e.message });
  }
});

export default router;
