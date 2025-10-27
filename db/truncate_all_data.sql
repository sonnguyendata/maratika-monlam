-- Truncate all data to prepare for go-live
-- WARNING: This will delete ALL data from both tables
-- This is irreversible! Make sure you have backups if needed.

-- Truncate idempotency_keys first (depends on submissions)
TRUNCATE TABLE public.idempotency_keys CASCADE;

-- Truncate submissions (this will also reset the sequence)
TRUNCATE TABLE public.submissions RESTART IDENTITY CASCADE;

-- Verify tables are empty
SELECT 'idempotency_keys count: ' || COUNT(*) as result FROM public.idempotency_keys
UNION ALL
SELECT 'submissions count: ' || COUNT(*) FROM public.submissions;
