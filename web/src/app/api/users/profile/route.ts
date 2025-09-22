import { NextRequest, NextResponse } from 'next/server';
// import { connectToDatabase } from '../../../lib/mongo';
// import { User } from '../../../lib/models';
import { auth } from '@clerk/nextjs/server';

export async function GET() {
  // Temporarily disabled due to import issues
  return NextResponse.json({ error: 'Temporarily unavailable' }, { status: 503 });
}

export async function PUT(request: NextRequest) {
  // Temporarily disabled due to import issues
  return NextResponse.json({ error: 'Temporarily unavailable' }, { status: 503 });
}