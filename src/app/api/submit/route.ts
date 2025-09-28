import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { 
  submitTucSo, 
  checkIdempotencyKey, 
  storeIdempotencyKey, 
  getDailyTotalForUser 
} from '@/lib/database';
import { checkBurstSubmission, checkIPRateLimit } from '@/lib/redis';
import { 
  hashString, 
  getClientIP, 
  getUserAgent, 
  validateEventDates,
  detectAnomalies 
} from '@/lib/utils';

const submitSchema = z.object({
  id: z.string().min(1, 'ID is required'),
  name: z.string().min(1, 'Name is required'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
  note: z.string().optional(),
  idempotency_key: z.string().uuid('Invalid idempotency key')
});

export async function POST(request: NextRequest) {
  try {
    // Check if event is active
    if (!validateEventDates()) {
      return NextResponse.json(
        { ok: false, error: 'Event is not currently active' },
        { status: 400 }
      );
    }

    // Get client info
    const clientIP = getClientIP(request);
    const userAgent = getUserAgent(request);
    const ipHash = hashString(clientIP, process.env.HASH_SALT || 'default-salt');
    const uaHash = hashString(userAgent, process.env.HASH_SALT || 'default-salt');

    // Rate limiting
    const ipAllowed = await checkIPRateLimit(ipHash);
    if (!ipAllowed) {
      return NextResponse.json(
        { ok: false, error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = submitSchema.parse(body);

    // Check idempotency
    const isDuplicate = await checkIdempotencyKey(validatedData.idempotency_key);
    if (isDuplicate) {
      return NextResponse.json(
        { ok: false, error: 'Duplicate submission' },
        { status: 409 }
      );
    }

    // Check burst submission
    const burstAllowed = await checkBurstSubmission(validatedData.id);
    if (!burstAllowed) {
      return NextResponse.json(
        { ok: false, error: 'Too many submissions in short time' },
        { status: 429 }
      );
    }

    // Submit to database
    const result = await submitTucSo(
      {
        attendee_id: validatedData.id,
        attendee_name: validatedData.name,
        quantity: validatedData.quantity,
        note: validatedData.note,
        idempotency_key: validatedData.idempotency_key
      },
      ipHash,
      uaHash
    );

    // Store idempotency key
    await storeIdempotencyKey(validatedData.idempotency_key, result.id);

    // Get user's daily total
    const dailyTotal = await getDailyTotalForUser(validatedData.id);

    return NextResponse.json({
      ok: true,
      daily_total: dailyTotal
    });

  } catch (error) {
    console.error('Submit error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { ok: false, error: 'Invalid data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
