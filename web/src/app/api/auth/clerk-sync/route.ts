import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import { connectToDatabase } from '../../../../lib/mongo';
import { NextRequest, NextResponse } from 'next/server';

// Auth0 JWKS client for token verification
const client = jwksClient({
  jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`
});

function getKey(header: any, callback: any) {
  client.getSigningKey(header.kid, function(err, key) {
    const signingKey = key?.getPublicKey();
    callback(null, signingKey);
  });
}

export async function POST(request: NextRequest) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify Auth0 JWT token
    const decoded = await new Promise((resolve, reject) => {
      jwt.verify(token, getKey, {
        audience: process.env.AUTH0_CLIENT_ID,
        issuer: `https://${process.env.AUTH0_DOMAIN}/`,
        algorithms: ['RS256']
      }, (err, decoded) => {
        if (err) reject(err);
        else resolve(decoded);
      });
    });

    const userId = (decoded as any).sub;
    if (!userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const db = await connectToDatabase();
    const users = db.collection('users');

    const body = await request.json();
    const { email, username, displayName } = body;

    await users.updateOne(
      { auth0Id: userId },
      {
        $set: {
          auth0Id: userId,
          lastActiveAt: new Date(),
        },
        $setOnInsert: {
          friends: [],
          friendRequestsSent: [],
          friendRequestsReceived: [],
          communityIds: [],
          projectIds: [],
          settings: {
            showPublicCommunities: true,
            notifications: { email: true, push: true },
          },
        },
      },
      { upsert: true }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}