import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/mongo';
import { logger } from '../../../lib/logger';

export async function GET(request: NextRequest) {
  try {
    const db = await connectToDatabase();

    // Get recent activity
    const recentMessages = await db.collection('messages')
      .find({})
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray();

    const recentUsers = await db.collection('users')
      .find({})
      .sort({ lastActiveAt: -1 })
      .limit(10)
      .toArray();

    const recentAuditLogs = await db.collection('audit_logs')
      .find({})
      .sort({ timestamp: -1 })
      .limit(20)
      .toArray();

    // Get error counts from logs (simplified)
    const errorCount = await db.collection('audit_logs')
      .countDocuments({ success: false });

    const dashboard = {
      timestamp: new Date().toISOString(),
      activity: {
        recentMessages,
        recentUsers,
        recentAuditLogs,
      },
      alerts: {
        errorCount,
        // Add more alerts as needed
      },
      performance: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
      },
    };

    return NextResponse.json(dashboard);
  } catch (error) {
    logger.error('Dashboard error', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}