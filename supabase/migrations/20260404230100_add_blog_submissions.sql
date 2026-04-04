-- Blog submissions from users (goes to DRAFT for admin review)
-- Uses existing blog_posts table with additional fields for user submissions

-- Add submitted_by fields to blog_posts for user submissions
ALTER TABLE blog_posts
ADD COLUMN IF NOT EXISTS submitted_by_name text,
ADD COLUMN IF NOT EXISTS submitted_by_email text,
ADD COLUMN IF NOT EXISTS submission_notes text,
ADD COLUMN IF NOT EXISTS reviewed_by text,
ADD COLUMN IF NOT EXISTS reviewed_at timestamptz;

NOTIFY pgrst, 'reload schema';
