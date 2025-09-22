import { auth } from '@clerk/nextjs/server';
import { connectToDatabase } from '../../../../lib/mongo';
import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';

// POST /api/friends/accept - Accept friend request
export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const db = await connectToDatabase();
    const users = db.collection('users');
    const channels = db.collection('channels');

    const body = await request.json();
    const { fromUserId } = body;

    if (!fromUserId) return NextResponse.json({ error: 'fromUserId required' }, { status: 400 });

    // Check if request exists
    const user = await users.findOne({ clerkId: userId });
    if (!user || !user.friendRequestsReceived.includes(fromUserId)) {
      return NextResponse.json({ error: 'No pending request' }, { status: 400 });
    }

    // Add to friends
    await users.updateOne(
      { clerkId: userId },
      {
        $addToSet: { friends: fromUserId },
        $pull: { friendRequestsReceived: fromUserId } as any
      }
    );
    await users.updateOne(
      { _id: new ObjectId(fromUserId) },
      {
        $addToSet: { friends: userId },
        $pull: { friendRequestsSent: userId } as any
      }
    );

    // Create DM channel if not exists
    const existingDM = await channels.findOne({
      type: 'dm',
      participantIds: { $all: [userId, fromUserId], $size: 2 }
    });

    if (!existingDM) {
      await channels.insertOne({
        type: 'dm',
        participantIds: [userId, fromUserId],
        slowModeSeconds: 0,
        pinnedMessageIds: [],
        createdAt: new Date(),
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}