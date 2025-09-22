import { connectToDatabase } from '../../../../../lib/mongo';
import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';

// GET /api/channels/[channelId]/messages - Get messages for channel
export async function GET(request: NextRequest, { params }: { params: { channelId: string } }) {
  try {
    const db = await connectToDatabase();
    const messages = db.collection('messages');

    const messageList = await messages
      .find({ channelId: params.channelId })
      .sort({ createdAt: 1 })
      .toArray();

    return NextResponse.json(messageList);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}