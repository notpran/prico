import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { operation, ...data } = await request.json();

    let result;
    switch (operation) {
      case 'init-repo':
        result = `Repo ${data.repoName} initialized for user ${data.userId}`;
        break;
      case 'commit':
        result = `Committed ${data.message} to ${data.repoName}`;
        break;
      case 'create-branch':
        result = `Branch ${data.branchName} created in ${data.repoName}`;
        break;
      case 'merge':
        result = `Merged ${data.sourceBranch} into ${data.targetBranch} in ${data.repoName}`;
        break;
      default:
        return NextResponse.json({ error: 'Unknown operation' }, { status: 400 });
    }

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error('Git operation error:', error);
    return NextResponse.json({ error: 'Git operation failed' }, { status: 500 });
  }
}