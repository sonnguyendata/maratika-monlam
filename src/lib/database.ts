import { createClient } from '@supabase/supabase-js';
import { SubmissionData, AdminRecord, AdminFilters, AdminResponse, ReportSummary } from '@/types';

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  throw new Error('SUPABASE_URL and SUPABASE_ANON_KEY environment variables are required');
}

export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export async function submitTucSo(data: SubmissionData, ipHash: string, uaHash: string) {
  const { data: result, error } = await supabase
    .from('submissions')
    .insert({
      attendee_id: data.attendee_id,
      attendee_name: data.attendee_name,
      quantity: data.quantity,
      note: data.note,
      idempotency_key: data.idempotency_key,
      ip_hash: ipHash,
      ua_hash: uaHash
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
  const today = new Date().toISOString().split('T')[0];
  
  const { data, error } = await supabase
    .from('submissions')
    .select('quantity')
    .eq('attendee_id', attendeeId)
    .gte('ts_server', `${today}T00:00:00`)
    .lt('ts_server', `${today}T23:59:59`)
    .eq('flagged', false);

  if (error) {
    throw new Error(`Database error: ${error.message}`);
  }

  return data.reduce((sum, record) => sum + record.quantity, 0);
}

export async function getReportSummary(): Promise<ReportSummary> {
  console.log('Getting report summary...');
  
  try {
    // Get totals
    console.log('Fetching summary data...');
    const { data: summaryData, error: summaryError } = await supabase
      .from('v_summary')
      .select('*')
      .single();

    if (summaryError) {
      console.error('Summary error:', summaryError);
      throw new Error(`Database error: ${summaryError.message}`);
    }

    console.log('Summary data:', summaryData);

    // Get daily breakdown
    console.log('Fetching daily data...');
    const { data: dailyData, error: dailyError } = await supabase
      .from('v_totals_by_day')
      .select('*')
      .order('date');

    if (dailyError) {
      console.error('Daily error:', dailyError);
      throw new Error(`Database error: ${dailyError.message}`);
    }

    console.log('Daily data:', dailyData);

    // Get top 10
    console.log('Fetching top10 data...');
    const { data: top10Data, error: top10Error } = await supabase
      .from('v_top10')
      .select('*');

    if (top10Error) {
      console.error('Top10 error:', top10Error);
      throw new Error(`Database error: ${top10Error.message}`);
    }

    console.log('Top10 data:', top10Data);

    const result = {
      totals: {
        all_time: summaryData?.total_count || 0,
        today: summaryData?.today_count || 0,
        unique_ids: summaryData?.unique_participants || 0
      },
      by_day: (dailyData || []).map(d => ({
        date: d.date,
        total: d.total
      })),
      top10: (top10Data || []).map((d, index) => ({
        id: d.attendee_id,
        name: d.attendee_name,
        total: d.total,
        submission_count: d.submission_count
      }))
    };

    console.log('Final result:', result);
    return result;
  } catch (error) {
    console.error('getReportSummary error:', error);
    throw error;
  }
}

export async function getAdminRecords(filters: AdminFilters): Promise<AdminResponse> {
  let query = supabase
    .from('submissions')
    .select('*', { count: 'exact' });

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

  // Apply pagination
  const page = filters.page || 1;
  const limit = filters.limit || 50;
  const offset = (page - 1) * limit;

  query = query
    .order('ts_server', { ascending: false })
    .range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    throw new Error(`Database error: ${error.message}`);
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
  const { error } = await supabase
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
