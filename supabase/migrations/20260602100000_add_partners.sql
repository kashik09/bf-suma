-- Partners/Distributors table for tracking the MLM network
-- This enables the partner leaderboard, commission tracking, and downline management

CREATE TABLE IF NOT EXISTS partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  partner_code TEXT UNIQUE NOT NULL,
  rank TEXT NOT NULL DEFAULT 'DISTRIBUTOR' CHECK (rank IN ('DISTRIBUTOR', 'SILVER', 'GOLD', 'DIAMOND')),
  sponsor_id UUID REFERENCES partners(id) ON DELETE SET NULL,
  region TEXT,
  total_volume INTEGER NOT NULL DEFAULT 0,
  commission_earned INTEGER NOT NULL DEFAULT 0,
  payout_status TEXT NOT NULL DEFAULT 'PENDING' CHECK (payout_status IN ('PENDING', 'PROCESSING', 'PAID')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_partners_customer ON partners(customer_id);
CREATE INDEX IF NOT EXISTS idx_partners_sponsor ON partners(sponsor_id);
CREATE INDEX IF NOT EXISTS idx_partners_rank ON partners(rank);
CREATE INDEX IF NOT EXISTS idx_partners_volume ON partners(total_volume DESC);
CREATE INDEX IF NOT EXISTS idx_partners_payout_status ON partners(payout_status);

-- Enable RLS
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;

-- Policy: Service role can do anything
CREATE POLICY "Service role full access" ON partners
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Policy: Authenticated users can read their own partner record
CREATE POLICY "Users can view own partner record" ON partners
  FOR SELECT
  USING (
    customer_id IN (
      SELECT id FROM customers WHERE email = auth.jwt() ->> 'email'
    )
  );

-- Function to generate unique partner code (PA-XXX format)
CREATE OR REPLACE FUNCTION generate_partner_code()
RETURNS TEXT AS $$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    new_code := 'PA-' || LPAD(FLOOR(RANDOM() * 1000)::TEXT, 3, '0');
    SELECT EXISTS(SELECT 1 FROM partners WHERE partner_code = new_code) INTO code_exists;
    EXIT WHEN NOT code_exists;
  END LOOP;
  RETURN new_code;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate partner code on insert
CREATE OR REPLACE FUNCTION set_partner_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.partner_code IS NULL THEN
    NEW.partner_code := generate_partner_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_partner_code
  BEFORE INSERT ON partners
  FOR EACH ROW
  EXECUTE FUNCTION set_partner_code();

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_partners_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_partners_updated_at
  BEFORE UPDATE ON partners
  FOR EACH ROW
  EXECUTE FUNCTION update_partners_updated_at();

-- Insert some sample data for development/demo
-- (These will be ignored if customers don't exist)
DO $$
BEGIN
  -- Only insert sample data if we have customers and no partners yet
  IF EXISTS (SELECT 1 FROM customers LIMIT 1) AND NOT EXISTS (SELECT 1 FROM partners LIMIT 1) THEN
    INSERT INTO partners (customer_id, partner_code, rank, region, total_volume, commission_earned, payout_status)
    SELECT
      c.id,
      'PA-' || LPAD((ROW_NUMBER() OVER())::TEXT, 3, '0'),
      CASE (ROW_NUMBER() OVER()) % 4
        WHEN 0 THEN 'DIAMOND'
        WHEN 1 THEN 'GOLD'
        WHEN 2 THEN 'SILVER'
        ELSE 'DISTRIBUTOR'
      END,
      CASE (ROW_NUMBER() OVER()) % 5
        WHEN 0 THEN 'Kampala — Central'
        WHEN 1 THEN 'Gulu'
        WHEN 2 THEN 'Mbarara'
        WHEN 3 THEN 'Wakiso — Kira'
        ELSE 'Jinja'
      END,
      FLOOR(RANDOM() * 20000000)::INTEGER,
      FLOOR(RANDOM() * 3000000)::INTEGER,
      CASE (ROW_NUMBER() OVER()) % 3
        WHEN 0 THEN 'PENDING'
        WHEN 1 THEN 'PAID'
        ELSE 'PAID'
      END
    FROM customers c
    LIMIT 6;
  END IF;
END $$;
