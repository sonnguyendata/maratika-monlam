import { NextRequest, NextResponse } from 'next/server';
import { getAdminRecords, updateRecordFlag, updateRecord, deleteRecord, getDuplicateRecords } from '@/lib/database';
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
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50
    };

    const result = await getAdminRecords(filters);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Admin records error:', error);
    
    return NextResponse.json(
      { error: 'Failed to fetch admin records' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // Verify authentication
    if (!verifyBasicAuth(request)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401, headers: { 'WWW-Authenticate': 'Basic' } }
      );
    }

    const body = await request.json();
    const { id, flagged, reason, updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Invalid request body - id is required' },
        { status: 400 }
      );
    }

    // Handle flag updates
    if (typeof flagged === 'boolean') {
      await updateRecordFlag(id, flagged, reason);
    }

    // Handle record updates
    if (updates && typeof updates === 'object') {
      await updateRecord(id, updates);
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update error:', error);
    
    return NextResponse.json(
      { error: 'Failed to update record' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Verify authentication
    if (!verifyBasicAuth(request)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401, headers: { 'WWW-Authenticate': 'Basic' } }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Record ID is required' },
        { status: 400 }
      );
    }

    await deleteRecord(parseInt(id));
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete error:', error);
    
    return NextResponse.json(
      { error: 'Failed to delete record' },
      { status: 500 }
    );
  }
}
