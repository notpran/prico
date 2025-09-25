import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export interface InternalTokenPayload {
  sub: string; // userId
  sid: string; // sessionId
  iat?: number;
  exp?: number;
}

export function signInternalToken(payload: Omit<InternalTokenPayload, 'iat' | 'exp'>, ttlSeconds = 3600) {
  return jwt.sign(payload, env.INTERNAL_JWT_SECRET, { expiresIn: ttlSeconds });
}

export function verifyInternalToken(token: string): InternalTokenPayload | null {
  try {
    return jwt.verify(token, env.INTERNAL_JWT_SECRET) as InternalTokenPayload;
  } catch {
    return null;
  }
}
