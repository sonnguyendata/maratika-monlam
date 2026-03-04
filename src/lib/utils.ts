import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import crypto from 'crypto';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function hashString(input: string, salt: string): string {
  return crypto.createHash('sha256').update(input + salt).digest('hex');
}

export function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip');
  
  if (cfConnectingIP) return cfConnectingIP;
  if (realIP) return realIP;
  if (forwarded) return forwarded.split(',')[0].trim();
  
  return 'unknown';
}

export function getUserAgent(request: Request): string {
  return request.headers.get('user-agent') || 'unknown';
}

export function generateIdempotencyKey(): string {
  return crypto.randomUUID();
}

export function validateEventDates(): boolean {
  // Check if submissions are disabled via environment variable
  if (process.env.DISABLE_SUBMISSIONS === 'true') {
    console.log('Submissions disabled via DISABLE_SUBMISSIONS environment variable');
    return false;
  }
  
  // Get current time in GMT+7 (Asia/Ho_Chi_Minh timezone)
  const now = new Date();
  const gmt7Offset = 7 * 60; // GMT+7 in minutes
  const localTime = new Date(now.getTime() + (gmt7Offset * 60 * 1000));
  const today = new Date(localTime.getFullYear(), localTime.getMonth(), localTime.getDate());
  
  // Parse event dates in GMT+7
  const eventStart = new Date(process.env.EVENT_START || '2026-03-13');
  const eventEnd = new Date(process.env.EVENT_END || '2026-03-18');
  
  // Set to end of day for event end (23:59:59.999)
  eventEnd.setHours(23, 59, 59, 999);
  
  // Set to start of day for event start (00:00:00.000)
  eventStart.setHours(0, 0, 0, 0);
  
  console.log('Event validation:', {
    NODE_ENV: process.env.NODE_ENV,
    EVENT_START: process.env.EVENT_START,
    EVENT_END: process.env.EVENT_END,
    DISABLE_SUBMISSIONS: process.env.DISABLE_SUBMISSIONS,
    now: now.toISOString(),
    today: today.toISOString(), 
    eventStart: eventStart.toISOString(),
    eventEnd: eventEnd.toISOString(),
    isActive: today >= eventStart && today <= eventEnd
  });
  
  // Check if current date is within event date range
  const isValid = today >= eventStart && today <= eventEnd;
  console.log('Event validation result:', isValid, isValid ? 'Event is active' : 'Event has ended');
  
  return isValid;
}

export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'Asia/Ho_Chi_Minh'
  });
}

export function formatDateTime(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZone: 'Asia/Ho_Chi_Minh'
  });
}

export function detectAnomalies(
  attendeeId: string,
  quantity: number,
  ipHash: string,
  uaHash: string,
  recentSubmissions: any[]
): string[] {
  const flags: string[] = [];
  
  // Check for burst submissions
  const recentCount = recentSubmissions.filter(s => 
    s.attendee_id === attendeeId && 
    new Date(s.ts_server) > new Date(Date.now() - 5 * 60 * 1000) // Last 5 minutes
  ).length;
  
  if (recentCount > 5) {
    flags.push('BurstByID');
  }
  
  // Check for extremely large quantities
  if (quantity > 10000) {
    flags.push('SpikeByQty');
  }
  
  // Check for multiple accounts from same IP
  const uniqueIds = new Set(recentSubmissions
    .filter(s => s.ip_hash === ipHash && new Date(s.ts_server) > new Date(Date.now() - 60 * 60 * 1000))
    .map(s => s.attendee_id)
  );
  
  if (uniqueIds.size > 3) {
    flags.push('MultiAccountSameIP');
  }
  
  return flags;
}
