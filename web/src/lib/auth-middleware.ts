// src/lib/auth-middleware.ts - Authentication middleware for API routes

import jwt from 'jsonwebtoken';
import { connectToDatabase } from './mongo';
import { NextRequest, NextResponse } from 'next/server';

export async function getCurrentUser(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return null;
    }

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'fallback-secret'
    ) as any;

    const db = await connectToDatabase();
    const users = db.collection('users');

    const user = await users.findOne({ _id: decoded.userId });

    return user;
  } catch (error) {
    console.error('Auth error:', error);
    return null;
  }
}

export async function requireAuth(request: NextRequest) {
  const user = await getCurrentUser(request);

  if (!user) {
    throw new Error('Unauthorized');
  }

  return user;
}

export async function requireAdmin(request: NextRequest): Promise<{ userId: string } | NextResponse> {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  const { userId } = authResult;

  // TODO: Check if user is admin in database
  // For now, just return userId
  return { userId };
}

export function validateApiKey(request: NextRequest): boolean {
  const apiKey = request.headers.get('x-api-key');
  const expectedKey = process.env.API_KEY;

  return apiKey === expectedKey;
}