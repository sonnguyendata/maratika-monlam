-- ============================================================================
-- Fix v_summary View to Exclude Flagged Records from Today's Calculations
-- ============================================================================
-- 
-- PROBLEM: v_summary was including flagged records in today's count, causing
--          mismatch between "Today" KPI and the daily chart bar.
-- 
-- SOLUTION: Add "AND flagged = FALSE" to today's calculations
-- 
-- IMPORTANT: Choose the version that matches your database schema
-- ============================================================================

-- ============================================================================
-- VERSION 1: For databases WITH deleted_at column
-- ============================================================================
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

-- ============================================================================
-- VERSION 2: For databases WITHOUT deleted_at column
--            (Comment out VERSION 1 above, uncomment below)
-- ============================================================================
-- DROP VIEW IF EXISTS public.v_summary;
--
-- CREATE VIEW public.v_summary AS
-- SELECT 
--   COUNT(DISTINCT attendee_id) as unique_participants,
--   SUM(quantity) as total_count,
--   COUNT(*) as total_submissions,
--   SUM(CASE WHEN DATE(ts_server AT TIME ZONE 'Asia/Ho_Chi_Minh') = (CURRENT_DATE AT TIME ZONE 'Asia/Ho_Chi_Minh')::DATE AND flagged = FALSE THEN quantity ELSE 0 END) as today_count,
--   COUNT(CASE WHEN DATE(ts_server AT TIME ZONE 'Asia/Ho_Chi_Minh') = (CURRENT_DATE AT TIME ZONE 'Asia/Ho_Chi_Minh')::DATE AND flagged = FALSE THEN 1 END) as today_submissions,
--   COUNT(CASE WHEN flagged = TRUE THEN 1 END) as flagged_count
-- FROM public.submissions;

