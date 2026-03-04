import { NextResponse } from 'next/server';
import { validateEventDates } from '@/lib/utils';

export async function GET() {
  try {
    const isEventActive = validateEventDates();
    const eventEnd = process.env.EVENT_END || '2026-03-18';
    
    return NextResponse.json({
      allowed: isEventActive,
      event_end: eventEnd,
      message: isEventActive 
        ? 'Submissions are currently accepted' 
        : 'Event has ended. Submissions are no longer accepted.'
    });
  } catch (error) {
    console.error('Status check error:', error);
    return NextResponse.json(
      { 
        allowed: false,
        message: 'Unable to check submission status'
      },
      { status: 500 }
    );
  }
}

