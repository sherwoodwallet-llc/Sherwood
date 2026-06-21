import { createHash } from "crypto";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

const MAX_FAILURES = Number(process.env.LOOKUP_MAX_FAILURES ?? "5");
const WINDOW_MINUTES = Number(process.env.LOOKUP_WINDOW_MINUTES ?? "15");
const LOCKOUT_MINUTES = Number(process.env.LOOKUP_LOCKOUT_MINUTES ?? "30");

function hashIdentifier(raw: string): string {
  const salt = process.env.RATE_LIMIT_SALT ?? "sherwood-allowance-v1";
  return createHash("sha256").update(`${salt}:${raw}`).digest("hex");
}

export function clientIdentifier(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() ?? request.headers.get("x-real-ip") ?? "unknown";
  return hashIdentifier(ip);
}

export async function getLockout(identifierHash: string): Promise<{
  locked: boolean;
  retryAfterSeconds?: number;
}> {
  const supabase = getSupabaseAdmin();
  const now = new Date();

  const { data } = await supabase
    .from("lookup_lockouts")
    .select("locked_until")
    .eq("identifier_hash", identifierHash)
    .maybeSingle();

  if (!data?.locked_until) return { locked: false };

  const lockedUntil = new Date(data.locked_until);
  if (lockedUntil <= now) {
    await supabase.from("lookup_lockouts").delete().eq("identifier_hash", identifierHash);
    return { locked: false };
  }

  return {
    locked: true,
    retryAfterSeconds: Math.ceil((lockedUntil.getTime() - now.getTime()) / 1000),
  };
}

export async function recordAttempt(identifierHash: string, success: boolean): Promise<void> {
  const supabase = getSupabaseAdmin();

  await supabase.from("lookup_attempts").insert({
    identifier_hash: identifierHash,
    success,
  });

  if (success) return;

  const windowStart = new Date(Date.now() - WINDOW_MINUTES * 60 * 1000).toISOString();

  const { count } = await supabase
    .from("lookup_attempts")
    .select("*", { count: "exact", head: true })
    .eq("identifier_hash", identifierHash)
    .eq("success", false)
    .gte("attempted_at", windowStart);

  if ((count ?? 0) >= MAX_FAILURES) {
    const lockedUntil = new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000).toISOString();
    await supabase.from("lookup_lockouts").upsert({
      identifier_hash: identifierHash,
      locked_until: lockedUntil,
    });
  }
}
