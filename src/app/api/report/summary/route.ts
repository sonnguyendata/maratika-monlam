import { NextRequest, NextResponse } from 'next/server';
import { getReportSummary } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const summary = await getReportSummary();
    
    return NextResponse.json(summary);
  } catch (error) {
    console.error('Report summary error:', error);
    
    return NextResponse.json(
      { error: 'Failed to fetch report summary' },
      { status: 500 }
    );
  }
}
