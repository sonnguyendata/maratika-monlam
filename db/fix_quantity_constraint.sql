-- Fix quantity constraint to allow 0 values
-- This migration updates the quantity constraint to allow values >= 0

-- Drop the existing constraint
ALTER TABLE public.submissions DROP CONSTRAINT IF EXISTS submissions_quantity_check;

-- Add the new constraint that allows 0
ALTER TABLE public.submissions ADD CONSTRAINT submissions_quantity_check CHECK (quantity >= 0);

-- Verify the constraint was updated
SELECT 
  conname as constraint_name,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.submissions'::regclass 
  AND conname = 'submissions_quantity_check';
