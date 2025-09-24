import mongoose from 'mongoose';
import { MONGODB_URL, DB_NAME } from './config.js';
function normalizeMongoUrl(u) {
  if (!u) return u;
  if (u.startsWith('mongodb+srv://')) {
    // Ensure db segment present (no trailing slash that creates empty collection namespace)
    const hasDb = /mongodb\+srv:\/\/[^/]+\/[^/?]+/.test(u);
    let out = u;
    if (!hasDb) {
      // Insert db name WITHOUT trailing slash
      out = out.replace(/mongodb\+srv:\/\/([^/]+)\/?/, 'mongodb+srv://$1/' + (DB_NAME || 'prico_db'));
    }
    // Remove any accidental '/?' pattern
    out = out.replace('/?', '?');
    // Remove trailing slash before query
    out = out.replace(/\/\?(.*)$/, (m, q) => '?' + q); // safety
    // Remove trailing slash at end of db segment if present
    out = out.replace(/(mongodb\+srv:\/\/[^/]+\/[^/?]+)\/$/, '$1');
    if (!/[?&]tls=/.test(out)) out += (out.includes('?') ? '&' : '?') + 'tls=true';
    return out;
  }
  return u.replace(/\/$/, '');
}
const NORMALIZED_URL = normalizeMongoUrl(MONGODB_URL);

let dbStatus = 'init';
let lastError = null;
let connectPromise = null;
let isConnectingFlag = false;

export function getDbStatus() {
  return { status: dbStatus, lastError: lastError ? String(lastError.message || lastError) : null };
}

export function isDbConnected() {
  return mongoose.connection && mongoose.connection.readyState === 1;
}

export async function waitForDb({ timeoutMs = 10000, intervalMs = 200 } = {}) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (isDbConnected()) return true;
    await new Promise(r => setTimeout(r, intervalMs));
  }
  return false;
}

export async function connectDB({ retries = 10, delayMs = 3000 } = {}) {
  if (isDbConnected()) return;
  if (isConnectingFlag) return connectPromise;
  isConnectingFlag = true;
  const redacted = NORMALIZED_URL.replace(/:(.*?)@/, ':****@');
  connectPromise = (async () => {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        dbStatus = 'connecting';
        console.log(`[DB] Attempt ${attempt}/${retries} connecting to ${redacted}`);
        await mongoose.connect(NORMALIZED_URL, {
          maxPoolSize: 10,
          serverSelectionTimeoutMS: 5000,
          dbName: DB_NAME || 'prico_db'
        });
        dbStatus = 'connected';
        console.log('[DB] Connected');
        console.log('[DB] Database name:', mongoose.connection && mongoose.connection.name);
        console.log('[DB] Collections known:', Object.keys(mongoose.connection.collections));
        return;
      } catch (err) {
        lastError = err;
        dbStatus = 'error';
        console.error(`[DB] Attempt ${attempt} failed: ${err.message}`);
        if (attempt === retries) {
          console.error('[DB] Exhausted retries, continuing without DB (degraded)');
          return; // degraded mode
        }
        await new Promise(r => setTimeout(r, delayMs));
      }
    }
  })().finally(() => { isConnectingFlag = false; });
  return connectPromise;
}

// Ensures a connection attempt has been made and optionally waits for readiness
export async function ensureDbConnected({ waitTimeoutMs = 10000 } = {}) {
  if (!isDbConnected()) {
    // Kick off connect if not already running
    await connectDB();
  }
  if (!isDbConnected()) {
    await waitForDb({ timeoutMs: waitTimeoutMs });
  }
  if (!isDbConnected()) {
    console.warn('[DB] ensureDbConnected: DB still not connected after wait');
    return false;
  }
  return true;
}
