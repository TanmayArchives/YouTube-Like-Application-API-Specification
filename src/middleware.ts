import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { verifyAuth } from './lib/auth';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(20, '10 s'),
});

export async function middleware(request: NextRequest) {
  // Rate limiting
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const ip = request.ip ?? '127.0.0.1';
    const { success } = await ratelimit.limit(ip);
    
    if (!success) {
      return NextResponse.json(
        { message: 'Too many requests' },
        { status: 429 }
      );
    }
  }

  // Auth checking
  if (!request.nextUrl.pathname.startsWith('/api/auth/')) {
    const authHeader = request.headers.get('authorization');

    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: 'No token provided' },
        { status: 403 }
      );
    }

    try {
      const token = authHeader.split(' ')[1];
      const verifiedToken = await verifyAuth(token);
      
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-id', verifiedToken.userId);
      requestHeaders.set('x-user-email', verifiedToken.email);

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    } catch (error) {
      return NextResponse.json(
        { message: 'Invalid token' },
        { status: 403 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
}; 