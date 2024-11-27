import type { NextApiRequest, NextApiResponse } from 'next';

interface RateLimiterOptions {
  windowMs: number;
  max: number;
}
const store = new Map<string, { count: number; resetTime: number }>();

export function createRateLimiter({ windowMs, max }: RateLimiterOptions) {
  return function rateLimiterMiddleware(
    req: NextApiRequest,
    res: NextApiResponse,
    next: () => void
  ) {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    const key = `${ip}`;
    const now = Date.now();
    for (const [storedKey, value] of store.entries()) {
      if (value.resetTime <= now) {
        store.delete(storedKey);
      }
    }

    const current = store.get(key);
    
    if (!current) {
      store.set(key, {
        count: 1,
        resetTime: now + windowMs,
      });
      return next();
    }

    if (current.resetTime <= now) {
      store.set(key, {
        count: 1,
        resetTime: now + windowMs,
      });
      return next();
    }

    if (current.count >= max) {
      // Rate limit exceeded
      return res.status(429).json({
        message: 'Too many requests, please try again later.',
      });
    }
    current.count += 1;
    store.set(key, current);
    
    return next();
  };
} 