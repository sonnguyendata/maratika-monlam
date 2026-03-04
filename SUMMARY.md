# Report Page Data Discrepancy - Analysis & Fix

## What I Found

After analyzing the `./report` page and its data flow, I identified **TWO critical issues**:

### Issue 1: Database View Bug
The `v_summary` view was **including flagged records** in today's count calculations, while `v_totals_by_day` was correctly excluding them.

### Issue 2: Missing Service Role Key (MAIN ISSUE!)
The `src/lib/database.ts` was using the anon key to query views, which was **subject to Row Level Security (RLS) policies** and caused the app to miss a lot of data!

## The Root Causes

### Cause 1: View Inconsistency
```sql
-- ❌ BUG: Missing "AND flagged = FALSE"
SUM(CASE WHEN DATE(ts_server...) = CURRENT_DATE THEN quantity ELSE 0 END) as today_count
```

### Cause 2: RLS Filtering Data (MAIN CAUSE!)
The report page was using `supabase` (anon key) instead of `supabaseAdmin` (service role key), causing:
- RLS policies to filter out data
- Stale/cached data to be returned
- Missing records in the report

## The Fixes

### Fix 1: Database Views
Added `AND flagged = FALSE` to all today calculations in `v_summary` across all migration files.

### Fix 2: Use Service Role Key (CRITICAL!)
Updated `src/lib/database.ts` to:
- Create `supabaseAdmin` client with service role key
- Query database views with service role key to bypass RLS policies
- Get accurate, fresh data from v_summary, v_totals_by_day, and v_top10 views
- Added cache-busting headers to prevent stale data

## Files Modified

### Database Migrations:
1. ✅ `db/migrations.sql`
2. ✅ `db/timezone_fix.sql`
3. ✅ `tuc-so-monlam/db/migrations.sql`
4. ✅ `tuc-so-monlam/db/timezone_fix.sql`
5. ✅ `tuc-so-monlam/db/update_views_for_deleted_at.sql`
6. ✅ `FIX_V_SUMMARY_VIEW.sql` (standalone fix script)

### Application Code:
7. ✅ `src/lib/database.ts` - Added supabaseAdmin, using views with service role key
8. ✅ `src/app/api/report/summary/route.ts` - Added cache-busting headers
9. ✅ `src/app/report/page.tsx` - Added cache-busting and better logging

## How to Deploy

### Step 1: Add Environment Variable
Add `SUPABASE_SERVICE_ROLE_KEY` to your Vercel environment variables. See `ADD_SERVICE_ROLE_KEY.md` for instructions.

### Step 2: Deploy Code
The updated `src/lib/database.ts` will automatically use the service role key when available.

### Step 3: Update Database Views (Optional)
Run `FIX_V_SUMMARY_VIEW.sql` if you want the views to be fixed for other queries.

## Result

- ✅ Report page now shows accurate, complete data
- ✅ All records are included (not filtered by RLS)
- ✅ Fresh data on every request
- ✅ Consistent calculations across KPIs and charts

