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
  // For development/testing, always allow submissions
  if (process.env.NODE_ENV === 'development') {
    return true;
  }
  
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  const eventStart = new Date(process.env.EVENT_START || '2025-10-29');
  const eventEnd = new Date(process.env.EVENT_END || '2025-11-02');
  
  // Add timezone offset and set to end of day for event end
  eventEnd.setHours(23, 59, 59, 999);
  
  console.log('Event validation:', {
    now: now.toISOString(),
    today: today.toISOString(), 
    eventStart: eventStart.toISOString(),
    eventEnd: eventEnd.toISOString(),
    isActive: today >= eventStart && today <= eventEnd
  });
  
  return today >= eventStart && today <= eventEnd;
}

export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
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
    second: '2-digit'
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
