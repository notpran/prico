import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/mongo';
import { Run } from '../../../lib/models';
import { auth } from '@clerk/nextjs/server';

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { code, language, stdin } = await request.json();

    if (!code || !language) {
      return NextResponse.json({ error: 'Code and language are required' }, { status: 400 });
    }

    const db = await connectToDatabase();

    const run: Run = {
      _id: '',
      userId,
      code,
      language,
      stdin,
      status: 'queued',
      createdAt: new Date(),
    };

    const result = await db.collection<Run>('runs').insertOne(run);
    run._id = result.insertedId.toString();

    // TODO: Queue the execution job

    return NextResponse.json(run);
  } catch (error) {
    console.error('Run code error:', error);
    return NextResponse.json({ error: 'Failed to execute code' }, { status: 500 });
  }
}