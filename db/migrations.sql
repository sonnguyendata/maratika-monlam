-- Túc Số Monlam Database Schema
-- Event: October 29 - November 2, 2025

-- Main submissions table
CREATE TABLE IF NOT EXISTS public.submissions (
  id BIGSERIAL PRIMARY KEY,
  attendee_id TEXT NOT NULL,
  attendee_name TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity >= 1),
  note TEXT,
  ts_server TIMESTAMPTZ NOT NULL DEFAULT (NOW() AT TIME ZONE 'Asia/Ho_Chi_Minh'),
  ip_hash TEXT,
  ua_hash TEXT,
  flagged BOOLEAN NOT NULL DEFAULT FALSE,
  flag_reason TEXT,
  idempotency_key UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Add idempotency_key column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'submissions' 
                   AND column_name = 'idempotency_key') THEN
        ALTER TABLE public.submissions ADD COLUMN idempotency_key UUID;
    END IF;
END $$;

-- Idempotency keys table to prevent duplicate submissions
CREATE TABLE IF NOT EXISTS public.idempotency_keys (
  key UUID PRIMARY KEY,
  submission_id BIGINT REFERENCES public.submissions(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_submissions_ts_server ON public.submissions (ts_server);
CREATE INDEX IF NOT EXISTS idx_submissions_attendee_id ON public.submissions (attendee_id);
CREATE INDEX IF NOT EXISTS idx_submissions_quantity ON public.submissions (quantity);
CREATE INDEX IF NOT EXISTS idx_submissions_flagged ON public.submissions (flagged);
CREATE INDEX IF NOT EXISTS idx_submissions_idempotency ON public.submissions (idempotency_key);

-- Views for reporting
-- Drop existing views if they exist
DROP VIEW IF EXISTS public.v_totals_by_day;
DROP VIEW IF EXISTS public.v_top10;
DROP VIEW IF EXISTS public.v_summary;

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

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_submissions_updated_at 
    BEFORE UPDATE ON public.submissions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.idempotency_keys ENABLE ROW LEVEL SECURITY;

-- Create policies (adjust based on your security requirements)
-- For now, allowing all operations - you may want to restrict this
CREATE POLICY "Allow all operations on submissions" ON public.submissions
    FOR ALL USING (true);

CREATE POLICY "Allow all operations on idempotency_keys" ON public.idempotency_keys
    FOR ALL USING (true);
