import { NextRequest, NextResponse } from 'next/server';
import { getAdminRecords } from '@/lib/database';
import { AdminFilters } from '@/types';

function verifyBasicAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return false;
  }
  
  const credentials = Buffer.from(authHeader.slice(6), 'base64').toString();
  const [username, password] = credentials.split(':');
  
  return username === process.env.ADMIN_USER && password === process.env.ADMIN_PASS;
}

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    if (!verifyBasicAuth(request)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401, headers: { 'WWW-Authenticate': 'Basic' } }
      );
    }

    const { searchParams } = new URL(request.url);
    
    const filters: AdminFilters = {
      date_from: searchParams.get('date_from') || undefined,
      date_to: searchParams.get('date_to') || undefined,
      attendee_id: searchParams.get('attendee_id') || undefined,
      attendee_name: searchParams.get('attendee_name') || undefined,
      quantity_min: searchParams.get('quantity_min') ? parseInt(searchParams.get('quantity_min')!) : undefined,
      quantity_max: searchParams.get('quantity_max') ? parseInt(searchParams.get('quantity_max')!) : undefined,
      flagged_only: searchParams.get('flagged_only') === 'true',
      page: 1,
      limit: 10000 // Large limit for export
    };

    const result = await getAdminRecords(filters);
    
    // Generate CSV
    const headers = [
      'ID',
      'Timestamp',
      'Attendee ID',
      'Attendee Name',
      'Quantity',
      'Note',
      'IP Hash',
      'UA Hash',
      'Flagged',
      'Flag Reason',
      'Idempotency Key'
    ];
    
    const csvRows = [
      headers.join(','),
      ...result.records.map(record => [
        record.id,
        record.ts_server,
        `"${record.attendee_id}"`,
        `"${record.attendee_name}"`,
        record.quantity,
        `"${record.note || ''}"`,
        record.ip_hash || '',
        record.ua_hash || '',
        record.flagged,
        `"${record.flag_reason || ''}"`,
        record.idempotency_key || ''
      ].join(','))
    ];
    
    const csv = csvRows.join('\n');
    
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="tuc-so-monlam-export-${new Date().toISOString().split('T')[0]}.csv"`
      }
    });
  } catch (error) {
    console.error('Export error:', error);
    
    return NextResponse.json(
      { error: 'Failed to export data' },
      { status: 500 }
    );
  }
}
