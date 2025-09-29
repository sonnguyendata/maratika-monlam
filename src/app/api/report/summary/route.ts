import { NextRequest, NextResponse } from 'next/server';
import { getReportSummary } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    console.log('Report summary API called');
    const summary = await getReportSummary();
    console.log('Report summary data:', summary);
    
    return NextResponse.json(summary);
  } catch (error) {
    console.error('Report summary error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch report summary', 
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : undefined) : undefined
      },
      { status: 500 }
    );
  }
}
