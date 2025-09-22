import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/mongo';

export async function GET() {
  try {
    // Check database connection
    const db = await connectToDatabase();
    await db.admin().ping();

    // Check other services (simplified)
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'healthy',
        api: 'healthy',
      },
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    };

    return NextResponse.json(health);
  } catch (error) {
    console.error('Health check failed:', error);

    const health = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    };

    return NextResponse.json(health, { status: 503 });
  }
}