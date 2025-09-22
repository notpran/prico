import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '../../../lib/auth-middleware';
import { deleteUserData, exportUserData, COMPLIANCE_CONFIG } from '../../../lib/enterprise';

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const { userId } = authResult;
    const { action } = await request.json();

    switch (action) {
      case 'export-data':
        const data = await exportUserData(userId);
        return NextResponse.json({ data });

      case 'delete-account':
        if (!COMPLIANCE_CONFIG.gdpr) {
          return NextResponse.json({ error: 'GDPR compliance not enabled' }, { status: 400 });
        }

        // TODO: Implement proper account deletion flow
        // This should be a multi-step process with confirmation
        await deleteUserData(userId);
        return NextResponse.json({ message: 'Account deletion initiated' });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Compliance API error:', error);
    return NextResponse.json({ error: 'Compliance operation failed' }, { status: 500 });
  }
}