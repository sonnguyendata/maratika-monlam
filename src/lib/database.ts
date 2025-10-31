import { createClient } from '@supabase/supabase-js';
import { SubmissionData, AdminRecord, AdminFilters, AdminResponse, ReportSummary } from '@/types';

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  throw new Error('SUPABASE_URL and SUPABASE_ANON_KEY environment variables are required');
}

export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Create admin client with service role key if available
export const supabaseAdmin = process.env.SUPABASE_SERVICE_ROLE_KEY 
  ? createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )
  : (console.warn('⚠️ SUPABASE_SERVICE_ROLE_KEY not set! Falling back to anon key. This may cause RLS/cache issues.'), supabase);

// For now, let's use the regular supabase client and see if we can make it work
// The issue might be with RLS policies
export const adminClient = supabase;

export async function submitTucSo(data: SubmissionData, ipHash: string, uaHash: string) {
  // Create timestamp in GMT+7 timezone
  const now = new Date();
  const gmt7Offset = 7 * 60; // GMT+7 in minutes
  const localTime = new Date(now.getTime() + (gmt7Offset * 60 * 1000));
  const tsServer = localTime.toISOString().replace('Z', '+07:00');
  
  const { data: result, error } = await supabase
    .from('submissions')
    .insert({
      attendee_id: data.attendee_id,
      attendee_name: data.attendee_name,
      quantity: data.quantity,
      note: data.note,
      idempotency_key: data.idempotency_key,
      ip_hash: ipHash,
      ua_hash: uaHash,
      ts_server: tsServer
    })
    .select('id')
    .single();

  if (error) {
    throw new Error(`Database error: ${error.message}`);
  }

  return result;
}

export async function checkIdempotencyKey(key: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('idempotency_keys')
    .select('key')
    .eq('key', key)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
    throw new Error(`Database error: ${error.message}`);
  }

  return !!data;
}

export async function storeIdempotencyKey(key: string, submissionId: number) {
  const { error } = await supabase
    .from('idempotency_keys')
    .insert({
      key,
      submission_id: submissionId
    });

  if (error) {
    throw new Error(`Database error: ${error.message}`);
  }
}

export async function getDailyTotalForUser(attendeeId: string): Promise<number> {
  // Get today in GMT+7 (Asia/Ho_Chi_Minh timezone)
  const now = new Date();
  const gmt7Offset = 7 * 60; // GMT+7 in minutes
  const localTime = new Date(now.getTime() + (gmt7Offset * 60 * 1000));
  const today = localTime.toISOString().split('T')[0];
  
  // Use supabaseAdmin to bypass RLS and ensure fresh data
  const { data, error } = await supabaseAdmin
    .from('submissions')
    .select('quantity')
    .eq('attendee_id', attendeeId)
    .gte('ts_server', `${today}T00:00:00+07:00`)
    .lt('ts_server', `${today}T23:59:59+07:00`)
    .eq('flagged', false)
    .is('deleted_at', null);

  if (error) {
    throw new Error(`Database error: ${error.message}`);
  }

  return data.reduce((sum, record) => sum + record.quantity, 0);
}

export async function getTotalCountForUser(attendeeId: string): Promise<number> {
  // Use supabaseAdmin to bypass RLS and ensure fresh data
  const { data, error } = await supabaseAdmin
    .from('submissions')
    .select('quantity')
    .eq('attendee_id', attendeeId)
    .eq('flagged', false)
    .is('deleted_at', null);

  if (error) {
    throw new Error(`Database error: ${error.message}`);
  }

  return data.reduce((sum, record) => sum + record.quantity, 0);
}

export async function getReportSummary(): Promise<ReportSummary> {
  console.log('Getting report summary...');
  console.log('Using supabaseAdmin client to bypass RLS');
  console.log('Environment check - SUPABASE_URL:', process.env.SUPABASE_URL ? 'Set' : 'Missing');
  console.log('Environment check - SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'Missing');
  
  try {
    // Query submissions table directly to ensure fresh data using admin client
    const { data: allSubmissions, error: submissionsError } = await supabaseAdmin
      .from('submissions')
      .select('*')
      .eq('flagged', false)
      .is('deleted_at', null);

    if (submissionsError) {
      console.error('Submissions error:', submissionsError);
      throw new Error(`Database error: ${submissionsError.message}`);
    }

    console.log('All submissions fetched:', allSubmissions?.length);
    console.log('Sample submission:', allSubmissions?.[0]);

    // Calculate totals
    const now = new Date();
    const gmt7Offset = 7 * 60; // GMT+7 in minutes
    const localTime = new Date(now.getTime() + (gmt7Offset * 60 * 1000));
    const today = localTime.toISOString().split('T')[0];

    const totalCount = allSubmissions?.reduce((sum, record) => sum + record.quantity, 0) || 0;
    const todayCount = allSubmissions?.filter(record => 
      record.ts_server.startsWith(today)
    ).reduce((sum, record) => sum + record.quantity, 0) || 0;
    const uniqueIds = new Set(allSubmissions?.map(record => record.attendee_id)).size || 0;

    // Calculate daily breakdown
    const dailyMap = new Map<string, number>();
    allSubmissions?.forEach(record => {
      const date = record.ts_server.split('T')[0];
      dailyMap.set(date, (dailyMap.get(date) || 0) + record.quantity);
    });
    
    const byDay = Array.from(dailyMap.entries())
      .map(([date, total]) => ({ date, total }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Calculate top 10
    const userMap = new Map<string, { name: string, total: number, count: number }>();
    allSubmissions?.forEach(record => {
      const key = record.attendee_id;
      const existing = userMap.get(key) || { name: record.attendee_name, total: 0, count: 0 };
      userMap.set(key, {
        name: record.attendee_name,
        total: existing.total + record.quantity,
        count: existing.count + 1
      });
    });

    const top10 = Array.from(userMap.entries())
      .map(([id, data]) => ({
        id,
        name: data.name,
        total: data.total,
        submission_count: data.count
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);

    const result = {
      totals: {
        all_time: totalCount,
        today: todayCount,
        unique_ids: uniqueIds
      },
      by_day: byDay,
      top10: top10
    };

    console.log('Final result - all_time:', totalCount, 'today:', todayCount, 'unique:', uniqueIds);
    console.log('Top 10 names:', top10.map(u => u.name));
    return result;
  } catch (error) {
    console.error('getReportSummary error:', error);
    throw error;
  }
}

export async function getAdminRecords(filters: AdminFilters): Promise<AdminResponse> {
  let query = supabaseAdmin
    .from('submissions')
    .select('*', { count: 'exact' });

  // Exclude soft-deleted records
  query = query.is('deleted_at', null);

  // Apply filters
  if (filters.date_from) {
    query = query.gte('ts_server', `${filters.date_from}T00:00:00`);
  }
  if (filters.date_to) {
    query = query.lte('ts_server', `${filters.date_to}T23:59:59`);
  }
  if (filters.attendee_id) {
    query = query.ilike('attendee_id', `%${filters.attendee_id}%`);
  }
  if (filters.attendee_name) {
    query = query.ilike('attendee_name', `%${filters.attendee_name}%`);
  }
  if (filters.quantity_min) {
    query = query.gte('quantity', filters.quantity_min);
  }
  if (filters.quantity_max) {
    query = query.lte('quantity', filters.quantity_max);
  }
  if (filters.flagged_only) {
    query = query.eq('flagged', true);
  }
  if (filters.duplicate_only) {
    // Filter for records where the same attendee_id appears multiple times with same quantity
    // This is a complex filter that needs to be done via a subquery or post-processing
    query = query.eq('flag_reason', 'DupKey');
  }

  // Apply sorting
  const sortBy = filters.sort_by || 'ts_server';
  const sortOrder = filters.sort_order || 'desc';
  
  console.log('Admin records sorting by:', sortBy, sortOrder);
  query = query.order(sortBy, { ascending: sortOrder === 'asc' });

  // Apply pagination
  const page = filters.page || 1;
  const limit = filters.limit || 50;
  const offset = (page - 1) * limit;

  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    console.error('Database query error:', error);
    throw new Error(`Database error: ${error.message}`);
  }

  console.log('Query successful, returned', data?.length || 0, 'records');
  if (data && data.length > 0 && sortBy === 'quantity') {
    console.log('First 3 quantity values:', data.slice(0, 3).map(r => ({ id: r.id, qty: r.quantity })));
  }

  return {
    records: data || [],
    total: count || 0,
    page,
    limit,
    total_pages: Math.ceil((count || 0) / limit)
  };
}

export async function updateRecordFlag(id: number, flagged: boolean, reason?: string) {
  // Use supabaseAdmin to bypass RLS and ensure consistency
  const { error } = await supabaseAdmin
    .from('submissions')
    .update({
      flagged,
      flag_reason: reason
    })
    .eq('id', id);

  if (error) {
    throw new Error(`Database error: ${error.message}`);
  }
}

export async function updateRecord(id: number, updates: {
  attendee_id?: string;
  attendee_name?: string;
  quantity?: number;
  note?: string;
}) {
  console.log('updateRecord called with:', id, updates);
  
  // Use supabaseAdmin to bypass RLS and ensure consistency
  const { data, error } = await supabaseAdmin
    .from('submissions')
    .update(updates)
    .eq('id', id)
    .select();

  console.log('updateRecord result:', { data, error });

  if (error) {
    console.error('updateRecord error:', error);
    throw new Error(`Database error: ${error.message}`);
  }

  console.log('updateRecord successful:', data);
  return data;
}

export async function deleteRecord(id: number) {
  console.log('deleteRecord called with:', id);
  
  // Use soft delete instead of hard delete to preserve data integrity
  // Use supabaseAdmin to bypass RLS and ensure consistency
  const { data, error } = await supabaseAdmin
    .from('submissions')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .select();

  console.log('deleteRecord result:', { data, error });

  if (error) {
    console.error('deleteRecord error:', error);
    throw new Error(`Database error: ${error.message}`);
  }

  console.log('deleteRecord successful:', data);
  return data;
}

export async function getDuplicateRecords(): Promise<AdminRecord[]> {
  // Use supabaseAdmin to bypass RLS and ensure consistency
  const { data, error } = await supabaseAdmin
    .from('submissions')
    .select('*')
    .eq('flagged', true)
    .eq('flag_reason', 'DupKey')
    .order('ts_server', { ascending: false });

  if (error) {
    throw new Error(`Database error: ${error.message}`);
  }

  return data || [];
}
