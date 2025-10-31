import { NextRequest, NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/database';

// Debug endpoint to test report data fetching
export async function GET(request: NextRequest) {
  try {
    console.log('=== REPORT DEBUG TEST ===');
    
    // Check which client is being used
    const isAdminClient = supabaseAdmin !== supabase;
    console.log('Is supabaseAdmin different from supabase?', isAdminClient);
    console.log('SUPABASE_SERVICE_ROLE_KEY exists?', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
    
    // Test query with admin client - get ALL records, not just 5
    console.log('Querying with supabaseAdmin...');
    const { data: adminData, error: adminError } = await supabaseAdmin
      .from('submissions')
      .select('id, quantity, ts_server, attendee_id, flagged, deleted_at')
      .eq('flagged', false)
      .is('deleted_at', null)
      .order('ts_server', { ascending: false });
    
    console.log('Admin client results:', { count: adminData?.length || 0, error: adminError });
    
    // Test query with regular client for comparison - get ALL records  
    console.log('Querying with supabase (anon)...');
    const { data: anonData, error: anonError } = await supabase
      .from('submissions')
      .select('id, quantity, ts_server, attendee_id, flagged, deleted_at')
      .eq('flagged', false)
      .is('deleted_at', null)
      .order('ts_server', { ascending: false });
    
    console.log('Anon client results:', { count: anonData?.length || 0, error: anonError });
    
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      usingAdminClient: isAdminClient,
      serviceRoleKeyExists: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      results: {
        adminClient: {
          count: adminData?.length || 0,
          sample: adminData?.slice(0, 3),
          allDates: adminData?.map((r: any) => r.ts_server).slice(0, 10),
          error: adminError?.message
        },
        anonClient: {
          count: anonData?.length || 0,
          sample: anonData?.slice(0, 3),
          allDates: anonData?.map((r: any) => r.ts_server).slice(0, 10),
          error: anonError?.message
        }
      }
    });
  } catch (error) {
    console.error('Debug test error:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

