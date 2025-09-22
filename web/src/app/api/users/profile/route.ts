import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/mongo';
import { User } from '../../../lib/models';
import { auth } from '@clerk/nextjs/server';

export async function GET() {
  try {
    const { userId } = auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const db = await connectToDatabase();
    const user = await db.collection<User>('users').findOne({ clerkId: userId });

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    return NextResponse.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { displayName, about, age } = await request.json();

    const db = await connectToDatabase();
    const result = await db.collection<User>('users').updateOne(
      { clerkId: userId },
      {
        $set: {
          displayName,
          about,
          age,
          lastActiveAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const updatedUser = await db.collection<User>('users').findOne({ clerkId: userId });
    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}