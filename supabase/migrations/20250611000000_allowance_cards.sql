-- QR Card Allowance Prototype — source of truth for program-assigned allowances.
-- Run via Supabase SQL editor or: supabase db push

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Program cards (never store full PAN, expiry, CVC, or raw PIN)
CREATE TABLE IF NOT EXISTS public.cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_card_id TEXT NOT NULL UNIQUE,
  last_four CHAR(4) NOT NULL CHECK (last_four ~ '^\d{4}$'),
  pin_hash TEXT NOT NULL,
  allowance_cents INTEGER NOT NULL CHECK (allowance_cents >= 0),
  currency CHAR(3) NOT NULL DEFAULT 'usd' CHECK (currency ~ '^[a-z]{3}$'),
  active BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cards_last_four_active ON public.cards (last_four)
  WHERE active = true;

CREATE INDEX IF NOT EXISTS idx_cards_stripe_card_id ON public.cards (stripe_card_id);

-- Failed/successful lookup attempts (rate limiting across serverless instances)
CREATE TABLE IF NOT EXISTS public.lookup_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier_hash TEXT NOT NULL,
  attempted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  success BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_lookup_attempts_identifier_time
  ON public.lookup_attempts (identifier_hash, attempted_at DESC);

-- Temporary lockouts after repeated failures
CREATE TABLE IF NOT EXISTS public.lookup_lockouts (
  identifier_hash TEXT PRIMARY KEY,
  locked_until TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lookup_lockouts_until ON public.lookup_lockouts (locked_until);

-- Staff sync audit trail (no PINs stored here)
CREATE TABLE IF NOT EXISTS public.sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_card_id TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('upsert', 'pin_reset', 'deactivate')),
  source TEXT NOT NULL DEFAULT 'google_sheets',
  synced_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-update updated_at on card changes
CREATE OR REPLACE FUNCTION public.set_cards_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS cards_updated_at ON public.cards;
CREATE TRIGGER cards_updated_at
  BEFORE UPDATE ON public.cards
  FOR EACH ROW
  EXECUTE FUNCTION public.set_cards_updated_at();

-- RLS: deny all direct client access; server uses service role only
ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lookup_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lookup_lockouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_logs ENABLE ROW LEVEL SECURITY;

-- No policies = no anon/authenticated access via PostgREST

-- Purge lookup attempts older than 24h (optional cron via pg_cron)
COMMENT ON TABLE public.cards IS 'Program card allowances. PIN stored as bcrypt hash only.';
COMMENT ON TABLE public.lookup_attempts IS 'Rate-limit tracking for /api/allowance/lookup';
