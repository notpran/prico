import { auth } from '@clerk/nextjs/server';
import { connectToDatabase } from '../../../../../lib/mongo';
import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';

// POST /api/communities/[id]/join - Join community
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await connectToDatabase();
    const communities = db.collection('communities');

    const community = await communities.findOne({ _id: new ObjectId(id) });
    if (!community) {
      return NextResponse.json({ error: 'Community not found' }, { status: 404 });
    }

    if (community.privacy === 'private') {
      return NextResponse.json({ error: 'Cannot join private community' }, { status: 403 });
    }

    if (community.memberIds.includes(userId)) {
      return NextResponse.json({ error: 'Already a member' }, { status: 400 });
    }

    await communities.updateOne(
      { _id: new ObjectId(id) },
      { $push: { memberIds: userId } as any }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}