import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { rateLimiter } from './src/lib/redis';

// Rate limiting store (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 100; // requests per window

async function isRateLimited(ip: string): Promise<boolean> {
  // Use Redis-based rate limiting in production
  if (process.env.NODE_ENV === 'production' && process.env.REDIS_URL) {
    return await rateLimiter.isRateLimited(ip);
  }

  // Fallback to in-memory for development
  const now = Date.now();
  const userData = rateLimitStore.get(ip);

  if (!userData || now > userData.resetTime) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return false;
  }

  if (userData.count >= RATE_LIMIT_MAX) {
    return true;
  }

  userData.count++;
  return false;
}

export async function middleware(request: NextRequest) {
  // Get client IP
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
             request.headers.get('x-real-ip') ||
             'unknown';

  // Rate limiting
  if (await isRateLimited(ip)) {
    return new NextResponse('Too Many Requests', {
      status: 429,
      headers: {
        'Retry-After': '60',
        'Content-Type': 'text/plain',
      },
    });
  }

  // Security headers
  const response = NextResponse.next();

  // Set security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  // CORS headers for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    response.headers.set('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGINS || 'http://localhost:3000');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    response.headers.set('Access-Control-Max-Age', '86400');
  }

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { status: 200, headers: response.headers });
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};