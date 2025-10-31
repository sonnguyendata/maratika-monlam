import { NextRequest, NextResponse } from 'next/server';

// Debug endpoint to check environment variables
// WARNING: Don't expose sensitive data in production!
export async function GET(request: NextRequest) {
  const isDev = process.env.NODE_ENV === 'development';
  
  // In production, only show if admin authentication is provided
  const authHeader = request.headers.get('authorization');
  const isAuthenticated = authHeader?.includes('admin'); // Simple check for debugging
  
  if (!isDev && !isAuthenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const response = {
    environment: process.env.NODE_ENV,
    variables: {
      hasSupabaseUrl: !!process.env.SUPABASE_URL,
      hasSupabaseAnonKey: !!process.env.SUPABASE_ANON_KEY,
      hasSupabaseServiceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      hasRedisUrl: !!process.env.REDIS_URL,
      supabaseUrl: isDev ? process.env.SUPABASE_URL : undefined,
      serviceRoleKeyPreview: process.env.SUPABASE_SERVICE_ROLE_KEY 
        ? `${process.env.SUPABASE_SERVICE_ROLE_KEY.substring(0, 20)}...` 
        : 'NOT SET',
    },
    timestamp: new Date().toISOString(),
    message: process.env.SUPABASE_SERVICE_ROLE_KEY 
      ? '✅ SUPABASE_SERVICE_ROLE_KEY is set' 
      : '❌ SUPABASE_SERVICE_ROLE_KEY is NOT set - will fall back to anon key'
  };
  
  return NextResponse.json(response);
}

