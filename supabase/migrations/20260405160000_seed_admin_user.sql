-- Add must_reset_password column for forced password rotation
ALTER TABLE public.admin_users
ADD COLUMN IF NOT EXISTS must_reset_password boolean NOT NULL DEFAULT false;

-- Add password_version for session invalidation on password change
ALTER TABLE public.admin_users
ADD COLUMN IF NOT EXISTS password_version integer NOT NULL DEFAULT 1;

-- Development-only admin seeding
-- This block only runs if SUPABASE_ENV is not 'production'
-- In production, use the bootstrap script instead
DO $$
BEGIN
  -- Only seed default admin in non-production environments
  -- Check for production indicators
  IF current_setting('app.environment', true) = 'production' THEN
    RAISE NOTICE 'Skipping admin seed in production environment';
    RETURN;
  END IF;

  -- Insert development admin with forced password reset
  INSERT INTO public.admin_users (
    id,
    name,
    email,
    password_hash,
    role,
    is_active,
    must_reset_password
  )
  VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'Dev Admin',
    'admin@localhost',
    'scrypt$e293b304a85619d38231437b00d6c87f$e1d5804e71b6d9ea21dc0c053bb514ae6425790bf550f06441a415307fc19088031371c0cd32561d886c7dd3be2a438b909987242fa816f4e57d3ff229903298',
    'SUPER_ADMIN',
    true,
    true  -- MUST reset password on first login
  )
  ON CONFLICT ((lower(email))) DO NOTHING;

  RAISE NOTICE 'Development admin seeded: admin@localhost (must reset password)';
END
$$;
