import { Redis } from '@upstash/redis';

if (!process.env.REDIS_URL) {
  throw new Error('REDIS_URL environment variable is required');
}

// Parse Redis URL to extract token and convert to HTTPS
const redisUrl = new URL(process.env.REDIS_URL);
const token = redisUrl.password;
const httpsUrl = `https://${redisUrl.hostname}`;

console.log('Redis configuration:', {
  originalUrl: process.env.REDIS_URL,
  hostname: redisUrl.hostname,
  httpsUrl,
  hasToken: !!token,
  tokenLength: token?.length
});

export const redis = new Redis({
  url: httpsUrl,
  token: token
});

export async function rateLimit(key: string, limit: number, window: number): Promise<boolean> {
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
  const queueKey = 'submission_queue';
  await redis.lpush(queueKey, JSON.stringify(data));
}

export async function getQueueLength(): Promise<number> {
  const queueKey = 'submission_queue';
  return await redis.llen(queueKey);
}

export async function processQueue(): Promise<any[]> {
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
