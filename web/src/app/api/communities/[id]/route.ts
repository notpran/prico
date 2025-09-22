import { connectToDatabase } from '../../../../lib/mongo';
import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';

// GET /api/communities/[id] - Get community details + channels
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const db = await connectToDatabase();
    const communities = db.collection('communities');
    const channels = db.collection('channels');

    const community = await communities.findOne({ _id: new ObjectId(params.id) });
    if (!community) {
      return NextResponse.json({ error: 'Community not found' }, { status: 404 });
    }

    const communityChannels = await channels.find({ communityId: params.id }).toArray();

    return NextResponse.json({ ...community, channels: communityChannels });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}