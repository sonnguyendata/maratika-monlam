import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/database';

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

    // Test database connection
    const { data, error } = await supabase
      .from('submissions')
      .select('id, attendee_id, attendee_name, quantity')
      .limit(1);

    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message,
        details: error
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      data: data
    });
  } catch (error) {
    console.error('Test error:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to test database connection',
        details: error
      },
      { status: 500 }
    );
  }
}


