import axios from 'axios';
import crypto from 'crypto';
import * as jose from 'jose';

// Simple in-memory JWKS cache
let jwksCache = { keys: null, fetchedAt: 0 };
const JWKS_TTL_MS = 60 * 1000; // 1 minute

async function getJwks() {
  const now = Date.now();
  if (jwksCache.keys && (now - jwksCache.fetchedAt) < JWKS_TTL_MS) return jwksCache.keys;
  const { data } = await axios.get('https://api.clerk.dev/v1/jwks');
  jwksCache = { keys: data, fetchedAt: now };
  return data;
}

export async function verifyClerkToken(token) {
  if (!token) throw new Error('Missing token');
  const jwks = await getJwks();
  const { payload } = await jose.jwtVerify(token, jose.createRemoteJWKSet(new URL('https://api.clerk.dev/v1/jwks')));
  return payload; // includes sub (user id)
}
