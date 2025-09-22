import { auth } from '@clerk/nextjs/server';
import { connectToDatabase } from '../../../../lib/mongo';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/channels/dms - Get user's DM channels
export async function GET() {
  try {
    const { userId } = auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const db = await connectToDatabase();
    const channels = db.collection('channels');

    const dmChannels = await channels.find({
      type: 'dm',
      participantIds: userId
    }).toArray();

    return NextResponse.json(dmChannels);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}