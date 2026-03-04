# Report Page Data Discrepancy Fix

## Problem Identified

The report page (`./report`) was showing a discrepancy between:
- **"Today" KPI** (showing 19,140)
- **Nov 1 bar in the daily chart** (appearing very small, almost zero)

## Root Cause

The database view `v_summary` had a bug where it was **including flagged records** in the today's count calculations, while the `v_totals_by_day` view was correctly excluding them.

### The Bug

In the original `v_summary` view definition, today's calculations were:
```sql
SUM(CASE WHEN DATE(ts_server AT TIME ZONE 'Asia/Ho_Chi_Minh') = (CURRENT_DATE AT TIME ZONE 'Asia/Ho_Chi_Minh')::DATE THEN quantity ELSE 0 END) as today_count,
COUNT(CASE WHEN DATE(ts_server AT TIME ZONE 'Asia/Ho_Chi_Minh') = (CURRENT_DATE AT TIME ZONE 'Asia/Ho_Chi_Minh')::DATE THEN 1 END) as today_submissions,
```

Notice there's **NO `AND flagged = FALSE`** condition here!

Meanwhile, `v_totals_by_day` was correctly filtering:
```sql
WHERE flagged = FALSE AND deleted_at IS NULL
```

### Why This Caused the Discrepancy

1. When submissions were flagged by admins (e.g., for suspicious activity)
2. The `v_summary` view still counted them in today's totals
3. But `v_totals_by_day` properly excluded them from the chart
4. Result: Mismatch between the "Today" KPI and the Nov 1 bar in the chart

## Solution

Added `AND flagged = FALSE` condition to the today calculations in `v_summary`:

```sql
SUM(CASE WHEN DATE(ts_server AT TIME ZONE 'Asia/Ho_Chi_Minh') = (CURRENT_DATE AT TIME ZONE 'Asia/Ho_Chi_Minh')::DATE AND flagged = FALSE THEN quantity ELSE 0 END) as today_count,
COUNT(CASE WHEN DATE(ts_server AT TIME ZONE 'Asia/Ho_Chi_Minh') = (CURRENT_DATE AT TIME ZONE 'Asia/Ho_Chi_Minh')::DATE AND flagged = FALSE THEN 1 END) as today_submissions,
```

## Files Fixed

All migration files that define `v_summary` have been updated:

1. **`db/migrations.sql`** - Main migration file
2. **`db/timezone_fix.sql`** - Timezone fix migration
3. **`FIX_V_SUMMARY_VIEW.sql`** - Standalone fix script (both versions with/without deleted_at)
4. **`tuc-so-monlam/db/migrations.sql`** - Main migration file (with deleted_at)
5. **`tuc-so-monlam/db/timezone_fix.sql`** - Timezone fix migration
6. **`tuc-so-monlam/db/update_views_for_deleted_at.sql`** - Views update migration

## How to Apply the Fix

### Option 1: Run the Fix Script

Run the standalone fix script `FIX_V_SUMMARY_VIEW.sql`:

**For databases WITH deleted_at column** (default):
```bash
psql $DATABASE_URL -f FIX_V_SUMMARY_VIEW.sql
```

**For databases WITHOUT deleted_at column**, edit `FIX_V_SUMMARY_VIEW.sql` and:
1. Comment out lines 13-25 (Version 1)
2. Uncomment lines 27-38 (Version 2)
3. Then run: `psql $DATABASE_URL -f FIX_V_SUMMARY_VIEW.sql`

### Option 2: Run Direct SQL in Supabase Dashboard

1. Go to your Supabase project SQL Editor
2. Run this SQL:

**For databases WITH deleted_at:**
```sql
DROP VIEW IF EXISTS public.v_summary;

CREATE VIEW public.v_summary AS
SELECT 
  COUNT(DISTINCT attendee_id) as unique_participants,
  SUM(quantity) as total_count,
  COUNT(*) as total_submissions,
  SUM(CASE WHEN DATE(ts_server AT TIME ZONE 'Asia/Ho_Chi_Minh') = (CURRENT_DATE AT TIME ZONE 'Asia/Ho_Chi_Minh')::DATE AND flagged = FALSE THEN quantity ELSE 0 END) as today_count,
  COUNT(CASE WHEN DATE(ts_server AT TIME ZONE 'Asia/Ho_Chi_Minh') = (CURRENT_DATE AT TIME ZONE 'Asia/Ho_Chi_Minh')::DATE AND flagged = FALSE THEN 1 END) as today_submissions,
  COUNT(CASE WHEN flagged = TRUE THEN 1 END) as flagged_count
FROM public.submissions
WHERE deleted_at IS NULL;
```

**For databases WITHOUT deleted_at** (remove the WHERE clause):
```sql
DROP VIEW IF EXISTS public.v_summary;

CREATE VIEW public.v_summary AS
SELECT 
  COUNT(DISTINCT attendee_id) as unique_participants,
  SUM(quantity) as total_count,
  COUNT(*) as total_submissions,
  SUM(CASE WHEN DATE(ts_server AT TIME ZONE 'Asia/Ho_Chi_Minh') = (CURRENT_DATE AT TIME ZONE 'Asia/Ho_Chi_Minh')::DATE AND flagged = FALSE THEN quantity ELSE 0 END) as today_count,
  COUNT(CASE WHEN DATE(ts_server AT TIME ZONE 'Asia/Ho_Chi_Minh') = (CURRENT_DATE AT TIME ZONE 'Asia/Ho_Chi_Minh')::DATE AND flagged = FALSE THEN 1 END) as today_submissions,
  COUNT(CASE WHEN flagged = TRUE THEN 1 END) as flagged_count
FROM public.submissions;
```

## Verification

After applying the fix, refresh the report page and verify:
1. The "Today" KPI should match the current day's bar height in the chart
2. Flagged submissions should not appear in today's count
3. The chart and KPIs should be consistent

## Data Flow Summary

```
Report Page (src/app/report/page.tsx)
  ↓
GET /api/report/summary
  ↓
getReportSummary() in src/lib/database.ts
  ↓
Queries Supabase Views:
  - v_summary (totals, today's count) ← FIXED
  - v_totals_by_day (daily chart data)
  - v_top10 (leaderboard)
```

The fix ensures all three views consistently exclude flagged records.

