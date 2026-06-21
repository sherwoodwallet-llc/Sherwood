import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export type CardRow = {
  id: string;
  stripe_card_id: string;
  last_four: string;
  pin_hash: string;
  allowance_cents: number;
  currency: string;
  active: boolean;
  updated_at: string;
  created_at: string;
};

let adminClient: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (adminClient) return adminClient;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }

  adminClient = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  return adminClient;
}
