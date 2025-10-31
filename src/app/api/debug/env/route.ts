import { NextRequest, NextResponse } from 'next/server';

// Debug endpoint to check environment variables
// WARNING: Don't expose sensitive data in production!
export async function GET(request: NextRequest) {
  const isDev = process.env.NODE_ENV === 'development';
  
  // NOTE: This endpoint should be secured or removed after debugging
  // For now, allowing access to diagnose the issue
  
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

