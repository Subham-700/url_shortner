import Redis from 'ioredis';
import { config } from './env';
import { logger } from '../utils/logger';

class RedisClient {
  private static instance: Redis | null = null;

  static getInstance(): Redis {
    if (!this.instance) {
      this.instance = new Redis({
        host: config.redis.host,
        port: config.redis.port,
        password: config.redis.password || undefined,
        maxRetriesPerRequest: 3,
        lazyConnect: true,
        // Connection pool settings
        family: 4,
        keepAlive: 10000,
        connectTimeout: 10000,
        retryStrategy(times) {
          if (times > 3) {
            logger.error('Redis: Max retries reached');
            return null;
          }
          return Math.min(times * 100, 3000);
        },
      });

      this.instance.on('connect', () => logger.info('✅ Redis connected'));
      this.instance.on('error', (err) => logger.error('Redis error:', err));
      this.instance.on('reconnecting', () => logger.warn('Redis reconnecting...'));
    }
    return this.instance;
  }
}

export const redis = RedisClient.getInstance();

export const CacheKeys = {
  URL: (code: string) => `url:${code}`,
  USER_URLS: (userId: string, page: number) => `user:${userId}:urls:${page}`,
  ANALYTICS: (urlId: string) => `analytics:${urlId}`,
  RATE_LIMIT: (ip: string) => `ratelimit:${ip}`,
} as const;

export class CacheService {
  static async get<T>(key: string): Promise<T | null> {
    const data = await redis.get(key);
    if (!data) return null;
    return JSON.parse(data) as T;
  }

  static async set(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
    const serialized = JSON.stringify(value);
    if (ttlSeconds) {
      await redis.setex(key, ttlSeconds, serialized);
    } else {
      await redis.set(key, serialized);
    }
  }

  static async del(...keys: string[]): Promise<void> {
    if (keys.length > 0) await redis.del(...keys);
  }

  static async incr(key: string): Promise<number> {
    return redis.incr(key);
  }

  // Bulk invalidate cache with pattern (use with caution in production)
  static async deletePattern(pattern: string): Promise<void> {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) await redis.del(...keys);
  }
}
