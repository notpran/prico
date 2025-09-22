import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/mongo';
import { requireAuth } from '../../../lib/auth-middleware';
import { validateChannelName } from '../../../lib/validation';
import { logAuditEvent } from '../../../lib/audit';
import { Community } from '../../../lib/models';

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
  let userId: string | undefined;

  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    userId = authResult.userId;

    const db = await connectToDatabase();
    const communities = db.collection<Community>('communities');

    const body = await request.json();
    const { name, description } = body;

    // Validate input
    if (!name || typeof name !== 'string' || !validateChannelName(name)) {
      return NextResponse.json({ error: 'Invalid community name' }, { status: 400 });
    }

    if (description && (typeof description !== 'string' || description.length > 500)) {
      return NextResponse.json({ error: 'Invalid description' }, { status: 400 });
    }

    // Generate slug
    const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');

    // Check if slug is unique
    const existing = await communities.findOne({ slug });
    if (existing) {
      return NextResponse.json({ error: 'Community name already exists' }, { status: 400 });
    }

    const newCommunity: Community = {
      _id: '', // Will be set by MongoDB
      name,
      slug,
      description: description || '',
      ownerId: userId,
      adminIds: [userId],
      memberIds: [userId],
      privacy: 'private',
      createdAt: new Date(),
      channels: [],
    };

    const result = await communities.insertOne(newCommunity);
    newCommunity._id = result.insertedId.toString();

    // Log audit event
    await logAuditEvent('CREATE', 'community', true, {
      userId,
      resourceId: newCommunity._id,
      details: { name, slug },
    });

    return NextResponse.json(newCommunity, { status: 201 });
  } catch (error) {
    console.error('Create community error:', error);

    // Log failed audit event
    await logAuditEvent('CREATE', 'community', false, {
      userId,
      details: { error: error instanceof Error ? error.message : 'Unknown error' },
    });

    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}