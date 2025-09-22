import { auth } from '@clerk/nextjs/server';
import { connectToDatabase } from '../../../lib/mongo';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await connectToDatabase();
    const users = db.collection('users');

    // Get user from Clerk (assume we have the data, or fetch)
    // For simplicity, assume the body has user data, or use Clerk API
    // But for now, basic upsert with clerkId

    const body = await request.json();
    const { email, username, displayName } = body;

    await users.updateOne(
      { clerkId: userId },
      {
        $set: {
          clerkId: userId,
          email,
          username,
          displayName,
          createdAt: new Date(),
          lastActiveAt: new Date(),
        },
        $setOnInsert: {
          friends: [],
          friendRequestsSent: [],
          friendRequestsReceived: [],
          communityIds: [],
          projectIds: [],
          settings: {
            showPublicCommunities: true,
            notifications: { email: true, push: true },
          },
        },
      },
      { upsert: true }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}