-- Drop test/debug functions that should not be in production
DROP FUNCTION IF EXISTS public.test_order_rpc_debug() CASCADE;
DROP FUNCTION IF EXISTS public.test_insert_idem_key() CASCADE;
DROP FUNCTION IF EXISTS public.debug_order_intake() CASCADE;
