-- Add updated_at and deleted_at fields to submissions table
-- Fix foreign key constraint for cascade delete

-- Add updated_at column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'submissions' 
                   AND column_name = 'updated_at') THEN
        ALTER TABLE public.submissions ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
END $$;

-- Add deleted_at column for soft deletes
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'submissions' 
                   AND column_name = 'deleted_at') THEN
        ALTER TABLE public.submissions ADD COLUMN deleted_at TIMESTAMPTZ;
    END IF;
END $$;

-- Create index on deleted_at for efficient filtering
CREATE INDEX IF NOT EXISTS idx_submissions_deleted_at ON public.submissions (deleted_at);

-- Drop the existing foreign key constraint
ALTER TABLE public.idempotency_keys 
DROP CONSTRAINT IF EXISTS idempotency_keys_submission_id_fkey;

-- Recreate with CASCADE DELETE to handle deletion automatically
ALTER TABLE public.idempotency_keys
ADD CONSTRAINT idempotency_keys_submission_id_fkey
FOREIGN KEY (submission_id) 
REFERENCES public.submissions(id) 
ON DELETE CASCADE;

-- Update the trigger function to handle updated_at properly
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Recreate the trigger if it doesn't exist
DROP TRIGGER IF EXISTS update_submissions_updated_at ON public.submissions;

CREATE TRIGGER update_submissions_updated_at 
    BEFORE UPDATE ON public.submissions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Set updated_at for existing records (if not already set)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'submissions' 
               AND column_name = 'updated_at') THEN
        UPDATE public.submissions 
        SET updated_at = NOW() 
        WHERE updated_at IS NULL;
    END IF;
END $$;
