-- Enable RLS on PII + sensitive tables
-- =====================================
-- This relies on service_role's BYPASSRLS attribute.
-- Anon and authenticated roles are denied by default (no policies).
-- All application code uses service_role via createServiceRoleSupabaseClient().

-- ============================================
-- TABLE 1: newsletter_subscribers
-- ============================================
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- ============================================
-- TABLE 2: admin_users
-- ============================================
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- ============================================
-- TABLE 3: order_events
-- ============================================
ALTER TABLE public.order_events ENABLE ROW LEVEL SECURITY;

-- ============================================
-- TABLE 4: order_status_history
-- ============================================
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;

-- ============================================
-- TABLE 5: order_items
-- ============================================
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- ============================================
-- TABLE 6: orders
-- ============================================
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- ============================================
-- TABLE 7: customers
-- ============================================
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;


-- =============================================
-- REVERT SQL (run if needed to disable RLS)
-- =============================================
-- ALTER TABLE public.newsletter_subscribers DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.admin_users DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.order_events DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.order_status_history DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.order_items DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.customers DISABLE ROW LEVEL SECURITY;
