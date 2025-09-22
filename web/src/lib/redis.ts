// src/lib/redis.ts - Redis configuration for scaling

import Redis from 'ioredis';

const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0'),
  retryDelayOnFailover: 100,
  enableReadyCheck: false,
  maxRetriesPerRequest: 3,
  lazyConnect: true,
  // Clustering configuration
  cluster: process.env.REDIS_CLUSTER === 'true' ? {
    enableOfflineQueue: false,
    redisOptions: {
      password: process.env.REDIS_PASSWORD,
    },
  } : undefined,
  // Sentinel configuration
  sentinels: process.env.REDIS_SENTINELS ? JSON.parse(process.env.REDIS_SENTINELS) : undefined,
  name: process.env.REDIS_MASTER_NAME || 'mymaster',
};

// Create Redis client
export const redis = process.env.REDIS_CLUSTER === 'true'
  ? new Redis.Cluster(
      JSON.parse(process.env.REDIS_CLUSTER_NODES || '[]'),
      redisConfig
    )
  : new Redis(redisConfig);

// Connection event handlers
redis.on('connect', () => {
  console.log('Redis connected');
});

redis.on('ready', () => {
  console.log('Redis ready');
});

redis.on('error', (err) => {
  console.error('Redis error:', err);
});

redis.on('close', () => {
  console.log('Redis connection closed');
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('Closing Redis connection...');
  await redis.quit();
});

process.on('SIGINT', async () => {
  console.log('Closing Redis connection...');
  await redis.quit();
});

// Cache utilities with TTL
export class Cache {
  private prefix: string;

  constructor(prefix = 'prico') {
    this.prefix = prefix;
  }

  private getKey(key: string): string {
    return `${this.prefix}:${key}`;
  }

  async get(key: string): Promise<string | null> {
    try {
      return await redis.get(this.getKey(key));
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    try {
      if (ttl) {
        await redis.setex(this.getKey(key), ttl, value);
      } else {
        await redis.set(this.getKey(key), value);
      }
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  async del(key: string): Promise<void> {
    try {
      await redis.del(this.getKey(key));
    } catch (error) {
      console.error('Cache del error:', error);
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const result = await redis.exists(this.getKey(key));
      return result === 1;
    } catch (error) {
      console.error('Cache exists error:', error);
      return false;
    }
  }

  async expire(key: string, ttl: number): Promise<void> {
    try {
      await redis.expire(this.getKey(key), ttl);
    } catch (error) {
      console.error('Cache expire error:', error);
    }
  }
}

export const cache = new Cache();

// Rate limiting with Redis
export class RateLimiter {
  private windowMs: number;
  private maxRequests: number;

  constructor(windowMs = 60000, maxRequests = 100) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
  }

  async isRateLimited(key: string): Promise<boolean> {
    const redisKey = `ratelimit:${key}`;
    const now = Date.now();
    const windowStart = now - this.windowMs;

    try {
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