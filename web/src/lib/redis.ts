// src/lib/redis.ts - Redis configuration for scaling

import Redis, { Cluster } from 'ioredis';

const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0'),
  retryDelayOnFailover: 100,
  enableReadyCheck: false,
  maxRetriesPerRequest: 3,
  lazyConnect: true,
};

let redisClient: Redis | null = null;
let redisAvailable = false;

function initRedis(): void {
  if (redisClient) return;
  
  try {
    redisClient = new Redis(redisConfig);
    redisAvailable = true;
    
    redisClient.on('connect', () => {
      console.log('Redis connected');
    });
    
    redisClient.on('ready', () => {
      console.log('Redis ready');
    });
    
    redisClient.on('error', (err) => {
      console.error('Redis error:', err);
      redisAvailable = false;
    });
    
    redisClient.on('close', () => {
      console.log('Redis connection closed');
      redisAvailable = false;
    });
  } catch (error) {
    console.warn('Failed to initialize Redis:', error);
    redisAvailable = false;
  }
}

// Initialize Redis
initRedis();

export const redis = {
  async get(key: string): Promise<string | null> {
    if (!redisAvailable || !redisClient) return null;
    try {
      return await redisClient.get(key);
    } catch {
      return null;
    }
  },
  
  async set(key: string, value: string): Promise<void> {
    if (!redisAvailable || !redisClient) return;
    try {
      await redisClient.set(key, value);
    } catch {
      // Ignore errors
    }
  },
  
  async setex(key: string, ttl: number, value: string): Promise<void> {
    if (!redisAvailable || !redisClient) return;
    try {
      await redisClient.setex(key, ttl, value);
    } catch {
      // Ignore errors
    }
  },
  
  async del(key: string): Promise<number> {
    if (!redisAvailable || !redisClient) return 0;
    try {
      return await redisClient.del(key);
    } catch {
      return 0;
    }
  },
  
  async exists(key: string): Promise<number> {
    if (!redisAvailable || !redisClient) return 0;
    try {
      return await redisClient.exists(key);
    } catch {
      return 0;
    }
  },
  
  async expire(key: string, ttl: number): Promise<number> {
    if (!redisAvailable || !redisClient) return 0;
    try {
      return await redisClient.expire(key, ttl);
    } catch {
      return 0;
    }
  },
  
  async zadd(key: string, score: number, member: string): Promise<number> {
    if (!redisAvailable || !redisClient) return 0;
    try {
      return await redisClient.zadd(key, score, member);
    } catch {
      return 0;
    }
  },
  
  async zcount(key: string, min: number, max: number): Promise<number> {
    if (!redisAvailable || !redisClient) return 0;
    try {
      return await redisClient.zcount(key, min, max);
    } catch {
      return 0;
    }
  },
  
  async zremrangebyscore(key: string, min: number, max: number): Promise<number> {
    if (!redisAvailable || !redisClient) return 0;
    try {
      return await redisClient.zremrangebyscore(key, min, max);
    } catch {
      return 0;
    }
  },
  
  on(event: string, handler: Function): void {
    if (redisClient) {
      redisClient.on(event, handler);
    }
  }
};

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('Closing Redis connection...');
  if (redisClient) {
    await redisClient.quit();
  }
});

process.on('SIGINT', async () => {
  console.log('Closing Redis connection...');
  if (redisClient) {
    await redisClient.quit();
  }
});

export class RateLimiter {
  private windowMs: number;
  private maxRequests: number;

  constructor(windowMs = 60000, maxRequests = 100) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
  }

  async isRateLimited(key: string): Promise<boolean> {
    try {
      const redisKey = `ratelimit:${key}`;
      const now = Date.now();
      const windowStart = now - this.windowMs;

      // Remove old entries
      await redis.zremrangebyscore(redisKey, 0, windowStart);

      // Count current requests
      const requestCount = await redis.zcount(redisKey, windowStart, now);

      if (requestCount >= this.maxRequests) {
        return true;
      }

      // Add current request
      await redis.zadd(redisKey, now, now.toString());

      // Set expiry on the key
      await redis.expire(redisKey, Math.ceil(this.windowMs / 1000));

      return false;
    } catch (error) {
      console.error('Rate limiter error:', error);
      return false; // Allow request on error
    }
  }
}

export const rateLimiter = new RateLimiter();
