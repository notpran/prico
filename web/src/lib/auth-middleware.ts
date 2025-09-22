// src/lib/auth-middleware.ts - Authentication middleware for API routes

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function requireAuth(request: NextRequest): Promise<{ userId: string } | NextResponse> {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return { userId };
  } catch (error) {
    console.error('Auth middleware error:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
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