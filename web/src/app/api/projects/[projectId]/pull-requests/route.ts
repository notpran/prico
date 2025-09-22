import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Temporarily disabled due to import issues
  return NextResponse.json({ error: 'Temporarily unavailable' }, { status: 503 });
}

export async function POST(request: NextRequest) {
  // Temporarily disabled due to import issues
  return NextResponse.json({ error: 'Temporarily unavailable' }, { status: 503 });
}