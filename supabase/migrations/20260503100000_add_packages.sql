-- Migration: 20260503100000_add_packages.sql
-- Add packages and package_items tables for purchasable health bundles

-- Packages table: purchasable health bundles containing multiple products
CREATE TABLE IF NOT EXISTS public.packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  tagline text,
  description text,
  hero_image_url text,
  infographic_image_url text,
  override_price_minor integer CHECK (override_price_minor IS NULL OR override_price_minor >= 0),
  currency text NOT NULL DEFAULT 'UGX',
  dm_keyword text,
  is_featured boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT packages_slug_non_empty CHECK (char_length(trim(slug)) > 0),
  CONSTRAINT packages_name_non_empty CHECK (char_length(trim(name)) > 0)
);

-- Package items: links packages to constituent products with quantities
CREATE TABLE IF NOT EXISTS public.package_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id uuid NOT NULL REFERENCES public.packages(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at timestamptz NOT NULL DEFAULT now(),

  UNIQUE (package_id, product_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_packages_slug ON public.packages (slug);
CREATE INDEX IF NOT EXISTS idx_packages_is_active ON public.packages (is_active);
CREATE INDEX IF NOT EXISTS idx_packages_is_featured ON public.packages (is_featured);
CREATE INDEX IF NOT EXISTS idx_packages_sort_order ON public.packages (sort_order);
CREATE INDEX IF NOT EXISTS idx_package_items_package_id ON public.package_items (package_id);
CREATE INDEX IF NOT EXISTS idx_package_items_product_id ON public.package_items (product_id);

-- Triggers for updated_at
DROP TRIGGER IF EXISTS trg_packages_updated_at ON public.packages;
CREATE TRIGGER trg_packages_updated_at
BEFORE UPDATE ON public.packages
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- RLS and permissions (service-role-only model consistent with existing tables)
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.package_items ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    EXECUTE 'REVOKE ALL ON public.packages FROM anon';
    EXECUTE 'REVOKE ALL ON public.package_items FROM anon';
  END IF;

  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    EXECUTE 'REVOKE ALL ON public.packages FROM authenticated';
    EXECUTE 'REVOKE ALL ON public.package_items FROM authenticated';
  END IF;

  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'service_role') THEN
    EXECUTE 'GRANT ALL ON public.packages TO service_role';
    EXECUTE 'GRANT ALL ON public.package_items TO service_role';
  END IF;
END $$;

NOTIFY pgrst, 'reload schema';
