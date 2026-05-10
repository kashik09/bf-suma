-- Add EXECUTIVE role to admin_users
-- EXECUTIVE has identical permissions to OPERATIONS but distinguishes
-- client (business owner) from internal team in audit logs.

-- Drop the existing unnamed CHECK constraint on role column
-- PostgreSQL auto-names it as "admin_users_role_check"
ALTER TABLE public.admin_users
DROP CONSTRAINT IF EXISTS admin_users_role_check;

-- Recreate with EXECUTIVE added
ALTER TABLE public.admin_users
ADD CONSTRAINT admin_users_role_check
CHECK (role IN ('SUPER_ADMIN', 'OPERATIONS', 'EXECUTIVE', 'SUPPORT'));

-- Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';

-- ============================================================
-- ROLLBACK (run manually if needed)
-- ============================================================
-- ALTER TABLE public.admin_users DROP CONSTRAINT IF EXISTS admin_users_role_check;
-- ALTER TABLE public.admin_users ADD CONSTRAINT admin_users_role_check CHECK (role IN ('SUPER_ADMIN', 'OPERATIONS', 'SUPPORT'));
-- UPDATE public.admin_users SET role = 'OPERATIONS' WHERE role = 'EXECUTIVE';
-- NOTIFY pgrst, 'reload schema';
