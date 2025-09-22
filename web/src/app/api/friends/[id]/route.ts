import { auth } from '@clerk/nextjs/server';
import { connectToDatabase } from '../../../../lib/mongo';
import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';

// DELETE /api/friends/[id] - Unfriend
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId } = auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const db = await connectToDatabase();
    const users = db.collection('users');

    // Remove from both friends lists
    await users.updateOne(
      { clerkId: userId },
      { $pull: { friends: params.id } }
    );
    await users.updateOne(
      { _id: new ObjectId(params.id) },
      { $pull: { friends: userId } }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}