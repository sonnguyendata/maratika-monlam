-- Update database views to exclude soft-deleted records
-- This ensures reports reflect admin changes (edits/deletes)

-- Drop existing views
DROP VIEW IF EXISTS public.v_totals_by_day;
DROP VIEW IF EXISTS public.v_top10;
DROP VIEW IF EXISTS public.v_summary;

-- Recreate views with deleted_at filter
CREATE VIEW public.v_totals_by_day AS
SELECT 
  DATE(ts_server AT TIME ZONE 'Asia/Ho_Chi_Minh') as date,
  SUM(quantity) as total
FROM public.submissions
WHERE flagged = FALSE AND deleted_at IS NULL
GROUP BY DATE(ts_server AT TIME ZONE 'Asia/Ho_Chi_Minh')
ORDER BY DATE(ts_server AT TIME ZONE 'Asia/Ho_Chi_Minh');

CREATE VIEW public.v_top10 AS
SELECT 
  attendee_id,
  attendee_name,
  SUM(quantity) as total,
  COUNT(*) as submission_count
FROM public.submissions
WHERE flagged = FALSE AND deleted_at IS NULL
GROUP BY attendee_id, attendee_name
ORDER BY total DESC
LIMIT 10;

-- Summary view for dashboard (using GMT+7 timezone)
CREATE VIEW public.v_summary AS
SELECT 
  COUNT(DISTINCT attendee_id) as unique_participants,
  SUM(quantity) as total_count,
  COUNT(*) as total_submissions,
  SUM(CASE WHEN DATE(ts_server AT TIME ZONE 'Asia/Ho_Chi_Minh') = (CURRENT_DATE AT TIME ZONE 'Asia/Ho_Chi_Minh')::DATE THEN quantity ELSE 0 END) as today_count,
  COUNT(CASE WHEN DATE(ts_server AT TIME ZONE 'Asia/Ho_Chi_Minh') = (CURRENT_DATE AT TIME ZONE 'Asia/Ho_Chi_Minh')::DATE THEN 1 END) as today_submissions,
  COUNT(CASE WHEN flagged = TRUE THEN 1 END) as flagged_count
FROM public.submissions
WHERE deleted_at IS NULL;
