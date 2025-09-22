import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/mongo';

export async function GET() {
  try {
    const db = await connectToDatabase();

    // Get basic metrics
    const metrics = {
      timestamp: new Date().toISOString(),
      users: await db.collection('users').countDocuments(),
      communities: await db.collection('communities').countDocuments(),
      channels: await db.collection('channels').countDocuments(),
      messages: await db.collection('messages').countDocuments(),
      projects: await db.collection('projects').countDocuments(),
      runs: await db.collection('runs').countDocuments(),
      audit_logs: await db.collection('audit_logs').countDocuments(),
      system: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        node_version: process.version,
        platform: process.platform,
      },
    };

    return NextResponse.json(metrics);
  } catch (error) {
    console.error('Metrics error:', error);
    return NextResponse.json({ error: 'Failed to fetch metrics' }, { status: 500 });
  }
}