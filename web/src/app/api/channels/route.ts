import { auth } from '@clerk/nextjs/server';
import { connectToDatabase } from '../../../lib/mongo';
import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';

// GET /api/channels?communityId= - List channels for community
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const communityId = searchParams.get('communityId');

    if (!communityId) {
      return NextResponse.json({ error: 'communityId required' }, { status: 400 });
    }

    const db = await connectToDatabase();
    const channels = db.collection('channels');

    const channelList = await channels.find({ communityId }).toArray();

    return NextResponse.json(channelList);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST /api/channels - Create channel
export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await connectToDatabase();
    const channels = db.collection('channels');
    const communities = db.collection('communities');

    const body = await request.json();
    const { communityId, name, type, participantIds } = body;

    // Validate
    if (!name || !type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (communityId) {
      // Check if user is member of community
      const community = await communities.findOne({ _id: new ObjectId(communityId) });
      if (!community || !community.memberIds.includes(userId)) {
        return NextResponse.json({ error: 'Not a member of community' }, { status: 403 });
      }
    } else if (type === 'dm') {
      // For DMs, participantIds required
      if (!participantIds || participantIds.length !== 1) {
        return NextResponse.json({ error: 'DM requires exactly one participant' }, { status: 400 });
      }
    }

    const newChannel = {
      communityId,
      name,
      type,
      participantIds: participantIds || [],
      slowModeSeconds: 0,
      pinnedMessageIds: [],
      createdAt: new Date(),
    };

    const result = await channels.insertOne(newChannel);

    // If community channel, add to community's channels array
    if (communityId) {
      await communities.updateOne(
        { _id: new ObjectId(communityId) },
        { $push: { channels: result.insertedId.toString() } }
      );
    }

    return NextResponse.json({ ...newChannel, _id: result.insertedId }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}