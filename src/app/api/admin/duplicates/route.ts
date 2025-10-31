import { NextRequest, NextResponse } from 'next/server';
import { getDuplicateRecords, deleteRecord } from '@/lib/database';

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

    const duplicates = await getDuplicateRecords();
    
    return NextResponse.json({ duplicates });
  } catch (error) {
    console.error('Get duplicates error:', error);
    
    return NextResponse.json(
      { error: 'Failed to fetch duplicates' },
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
    console.error('Delete duplicate error:', error);
    
    return NextResponse.json(
      { error: 'Failed to delete duplicate' },
      { status: 500 }
    );
  }
}


