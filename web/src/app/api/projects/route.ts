import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/mongo';
import { Project } from '../../../lib/models';
import { auth } from '@clerk/nextjs/server';

export async function GET(request: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const db = await connectToDatabase();
    const projects = await db.collection<Project>('projects').find({
      $or: [
        { ownerId: userId },
        { collaborators: userId },
        { visibility: 'public' }
      ]
    }).toArray();

    return NextResponse.json(projects);
  } catch (error) {
    console.error('Get projects error:', error);
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { name, description, visibility = 'private' } = await request.json();

    if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 });

    const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-');

    const db = await connectToDatabase();

    // Check if slug exists
    const existing = await db.collection<Project>('projects').findOne({ slug });
    if (existing) return NextResponse.json({ error: 'Project name already exists' }, { status: 400 });

    // Init Git repo
    const gitResponse = await fetch('http://localhost:3000/api/git', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ operation: 'init-repo', repoName: slug, userId }),
    });

    if (!gitResponse.ok) return NextResponse.json({ error: 'Failed to initialize repository' }, { status: 500 });

    const project: Project = {
      _id: '', // Will be set by Mongo
      name,
      slug,
      description,
      ownerId: userId,
      visibility,
      repoPath: `/repos/${userId}/${slug}`,
      defaultBranch: 'main',
      stars: [],
      collaborators: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection<Project>('projects').insertOne(project);
    project._id = result.insertedId.toString();

    return NextResponse.json(project);
  } catch (error) {
    console.error('Create project error:', error);
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}