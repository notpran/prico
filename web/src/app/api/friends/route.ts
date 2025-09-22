import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '../../../lib/auth-middleware';
import { connectToDatabase } from '../../../lib/mongo';
import { ObjectId } from 'mongodb';

// GET /api/friends - Get user's friends
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);

    const db = await connectToDatabase();
    const users = db.collection('users');

    // Get friend details
    const friends = await users.find({ _id: { $in: user.friends.map((id: string) => new ObjectId(id)) } }).toArray();

    return NextResponse.json(friends);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST /api/friends/request - Send friend request
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);

    const db = await connectToDatabase();
    const users = db.collection('users');

    const body = await request.json();
    const { toUserId } = body;

    if (!toUserId) return NextResponse.json({ error: 'toUserId required' }, { status: 400 });

    const toUser = await users.findOne({ _id: new ObjectId(toUserId) });
    if (!toUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // Add to sent and received
    await users.updateOne(
      { _id: user._id },
      { $addToSet: { friendRequestsSent: toUserId } }
    );
    await users.updateOne(
      { _id: new ObjectId(toUserId) },
      { $addToSet: { friendRequestsReceived: user._id.toString() } }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}