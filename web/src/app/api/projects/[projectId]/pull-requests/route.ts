import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/mongo';
import { PullRequest } from '../../../lib/models';
import { auth } from '@clerk/nextjs/server';

export async function GET(request: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    const db = await connectToDatabase();
    const query = projectId ? { projectId } : {};
    const prs = await db.collection<PullRequest>('pullrequests').find(query).toArray();

    return NextResponse.json(prs);
  } catch (error) {
    console.error('Get PRs error:', error);
    return NextResponse.json({ error: 'Failed to fetch PRs' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { projectId, sourceBranch, targetBranch, title, description } = await request.json();

    if (!projectId || !sourceBranch || !targetBranch || !title) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const db = await connectToDatabase();

    const pr: PullRequest = {
      _id: '',
      projectId,
      sourceRepoId: projectId, // Same repo for now
      sourceBranch,
      targetRepoId: projectId,
      targetBranch,
      authorId: userId,
      title,
      description,
      status: 'open',
      reviewers: [],
      comments: [],
      createdAt: new Date(),
    };

    const result = await db.collection<PullRequest>('pullrequests').insertOne(pr);
    pr._id = result.insertedId.toString();

    return NextResponse.json(pr);
  } catch (error) {
    console.error('Create PR error:', error);
    return NextResponse.json({ error: 'Failed to create PR' }, { status: 500 });
  }
}