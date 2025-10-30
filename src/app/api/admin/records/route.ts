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
  
  return username === process.env.ADMIN_USER && 
         password === process.env.ADMIN_PASS;
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
      duplicate_only: searchParams.get('duplicate_only') === 'true',
      sort_by: searchParams.get('sort_by') as any || 'ts_server',
      sort_order: searchParams.get('sort_order') as 'asc' | 'desc' || 'desc',
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50
    };

    console.log('API: Fetching records with filters:', JSON.stringify(filters));
    const result = await getAdminRecords(filters);
    console.log('API: Successfully fetched', result.records.length, 'records');
    
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
    console.log('PATCH request received');
    
    // Verify authentication
    if (!verifyBasicAuth(request)) {
      console.log('Authentication failed');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401, headers: { 'WWW-Authenticate': 'Basic' } }
      );
    }

    const body = await request.json();
    console.log('Request body:', body);
    const { id, flagged, reason, updates } = body;

    if (!id) {
      console.log('No ID provided');
      return NextResponse.json(
        { error: 'Invalid request body - id is required' },
        { status: 400 }
      );
    }

    // Handle flag updates
    if (typeof flagged === 'boolean') {
      console.log('Updating flag:', id, flagged, reason);
      await updateRecordFlag(id, flagged, reason);
    }

    // Handle record updates
    if (updates && typeof updates === 'object') {
      console.log('Updating record:', id, updates);
      const result = await updateRecord(id, updates);
      console.log('Update result:', result);
    }
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Update error:', error);
    console.error('Error message:', error?.message);
    console.error('Error stack:', error?.stack);
    
    return NextResponse.json(
      { 
        error: 'Failed to update record',
        details: error?.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    console.log('DELETE request received');
    
    // Verify authentication
    if (!verifyBasicAuth(request)) {
      console.log('Authentication failed');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401, headers: { 'WWW-Authenticate': 'Basic' } }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    console.log('Delete ID:', id);

    if (!id) {
      console.log('No ID provided for deletion');
      return NextResponse.json(
        { error: 'Record ID is required' },
        { status: 400 }
      );
    }

    console.log('Deleting record with ID:', id);
    const result = await deleteRecord(parseInt(id));
    console.log('Delete result:', result);
    
    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error('Delete error:', error);
    console.error('Error message:', error?.message);
    console.error('Error stack:', error?.stack);
    
    return NextResponse.json(
      { 
        error: 'Failed to delete record',
        details: error?.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
}
