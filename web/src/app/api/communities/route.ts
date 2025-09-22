import { auth } from '@clerk/nextjs/server';
import { connectToDatabase } from '../../../lib/mongo';
import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';

// GET /api/communities - List communities (public or user's)
export async function GET() {
  try {
    const db = await connectToDatabase();
    const communities = db.collection('communities');

    // For now, list all public communities
    const publicCommunities = await communities.find({ privacy: 'public' }).toArray();

    return NextResponse.json(publicCommunities);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST /api/communities - Create community
export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await connectToDatabase();
    const communities = db.collection('communities');

    const body = await request.json();
    const { name, slug, privacy, description } = body;

    // Validate required fields
    if (!name || !slug || !privacy) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if slug is unique
    const existing = await communities.findOne({ slug });
    if (existing) {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 400 });
    }

    const newCommunity = {
      name,
      slug,
      description: description || '',
      ownerId: userId,
      adminIds: [userId],
      memberIds: [userId],
      privacy,
      createdAt: new Date(),
      channels: [],
    };

    await communities.insertOne(newCommunity);

    return NextResponse.json(newCommunity, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}