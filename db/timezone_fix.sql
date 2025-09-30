-- Timezone Fix Migration for Túc Số Monlam
-- This script fixes timezone issues in the existing database

-- 1. Update the default value for ts_server column to use GMT+7
ALTER TABLE public.submissions 
ALTER COLUMN ts_server SET DEFAULT (NOW() AT TIME ZONE 'Asia/Ho_Chi_Minh');

-- 2. Update existing records to convert UTC timestamps to GMT+7
-- This assumes existing timestamps are in UTC and need to be converted to GMT+7
UPDATE public.submissions 
SET ts_server = ts_server AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Ho_Chi_Minh'
WHERE ts_server IS NOT NULL;

-- 3. Recreate the views with proper timezone handling
DROP VIEW IF EXISTS public.v_totals_by_day;
DROP VIEW IF EXISTS public.v_top10;
DROP VIEW IF EXISTS public.v_summary;

-- Daily totals view with GMT+7 timezone
CREATE VIEW public.v_totals_by_day AS
SELECT 
  DATE(ts_server AT TIME ZONE 'Asia/Ho_Chi_Minh') as date,
  SUM(quantity) as total
FROM public.submissions
WHERE flagged = FALSE
GROUP BY DATE(ts_server AT TIME ZONE 'Asia/Ho_Chi_Minh')
ORDER BY DATE(ts_server AT TIME ZONE 'Asia/Ho_Chi_Minh');

-- Top 10 view (no timezone changes needed)
CREATE VIEW public.v_top10 AS
SELECT 
  attendee_id,
  attendee_name,
  SUM(quantity) as total,
  COUNT(*) as submission_count
FROM public.submissions
WHERE flagged = FALSE
GROUP BY attendee_id, attendee_name
ORDER BY total DESC
LIMIT 10;

-- Summary view with GMT+7 timezone
CREATE VIEW public.v_summary AS
SELECT 
  COUNT(DISTINCT attendee_id) as unique_participants,
  SUM(quantity) as total_count,
  COUNT(*) as total_submissions,
  SUM(CASE WHEN DATE(ts_server AT TIME ZONE 'Asia/Ho_Chi_Minh') = (CURRENT_DATE AT TIME ZONE 'Asia/Ho_Chi_Minh')::DATE THEN quantity ELSE 0 END) as today_count,
  COUNT(CASE WHEN DATE(ts_server AT TIME ZONE 'Asia/Ho_Chi_Minh') = (CURRENT_DATE AT TIME ZONE 'Asia/Ho_Chi_Minh')::DATE THEN 1 END) as today_submissions,
  COUNT(CASE WHEN flagged = TRUE THEN 1 END) as flagged_count
FROM public.submissions;

-- 4. Verify the fix by checking a few records
SELECT 
  id,
  attendee_id,
  ts_server,
  ts_server AT TIME ZONE 'Asia/Ho_Chi_Minh' as ts_server_gmt7,
  DATE(ts_server AT TIME ZONE 'Asia/Ho_Chi_Minh') as date_gmt7
FROM public.submissions 
ORDER BY id DESC 
LIMIT 5;

