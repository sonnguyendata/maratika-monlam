import { Redis } from '@upstash/redis';

const redisUrlRaw = process.env.REDIS_URL;
let redis: Redis | null = null;

if (redisUrlRaw) {
  try {
    // Parse Redis URL to extract token and convert to HTTPS
    const redisUrl = new URL(redisUrlRaw);
    const token = redisUrl.password;
    const httpsUrl = `https://${redisUrl.hostname}`;

    console.log('Redis configuration:', {
      hostname: redisUrl.hostname,
      httpsUrl,
      hasToken: !!token,
      tokenLength: token?.length
    });

    redis = new Redis({
      url: httpsUrl,
      token: token
    });
  } catch (error) {
    console.warn('⚠️ Invalid REDIS_URL format. Redis features will be disabled.', error);
  }
} else {
  console.warn('⚠️ REDIS_URL is missing. Redis features will be disabled.');
}

export { redis };

export async function rateLimit(key: string, limit: number, window: number): Promise<boolean> {
  if (!redis) return true;

  try {
    const current = await redis.incr(key);

    if (current === 1) {
      await redis.expire(key, window);
    }

    return current <= limit;
  } catch (error) {
    console.error('Redis rate limit error:', error);
    // Allow request if Redis fails
    return true;
  }
}

export async function checkBurstSubmission(attendeeId: string, timeWindow: number = 300): Promise<boolean> {
  try {
    const key = `burst:${attendeeId}`;
    return await rateLimit(key, 10, timeWindow); // Max 10 submissions per 5 minutes
  } catch (error) {
    console.error('Redis burst check error:', error);
    // Allow request if Redis fails
    return true;
  }
}

export async function checkIPRateLimit(ipHash: string, timeWindow: number = 60): Promise<boolean> {
  try {
    const key = `ip:${ipHash}`;
    return await rateLimit(key, 50, timeWindow); // Max 50 requests per minute per IP
  } catch (error) {
    console.error('Redis IP rate limit error:', error);
    // Allow request if Redis fails
    return true;
  }
}

export async function queueSubmission(data: any): Promise<void> {
  if (!redis) return;

  const queueKey = 'submission_queue';
  await redis.lpush(queueKey, JSON.stringify(data));
}

export async function getQueueLength(): Promise<number> {
  if (!redis) return 0;

  const queueKey = 'submission_queue';
  return await redis.llen(queueKey);
}

export async function processQueue(): Promise<any[]> {
  if (!redis) return [];

  const queueKey = 'submission_queue';
  const batchSize = 10;
  const results = [];

  for (let i = 0; i < batchSize; i++) {
    const item = await redis.rpop(queueKey);
    if (!item) break;

    try {
      results.push(JSON.parse(item));
    } catch (error) {
      console.error('Failed to parse queue item:', error);
    }
  }

  return results;
}
