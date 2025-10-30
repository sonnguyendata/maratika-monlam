-- Add index for quantity column to improve sorting performance
CREATE INDEX IF NOT EXISTS idx_submissions_quantity ON public.submissions (quantity);

