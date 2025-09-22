import { connectToDatabase } from '../../../../../lib/mongo';
import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';

// GET /api/channels/[channelId]/messages?before=<messageId>&limit=50 - Get messages with pagination
export async function GET(request: NextRequest, { params }: { params: Promise<{ channelId: string }> }) {
  const { channelId } = await params;
  try {
    const { searchParams } = new URL(request.url);
    const before = searchParams.get('before');
    const limit = parseInt(searchParams.get('limit') || '50');

    const db = await connectToDatabase();
    const messages = db.collection('messages');

    let query: any = { channelId };
    if (before) {
      query._id = { $lt: new ObjectId(before) };
    }

    const messageList = await messages
      .find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();

    // Reverse to get chronological order
    messageList.reverse();

    return NextResponse.json(messageList);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}