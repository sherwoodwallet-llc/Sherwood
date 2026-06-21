import { getSupabaseAdmin, type CardRow } from "@/lib/supabase/admin";
import {
  formatAllowance,
  formatUpdatedAt,
  isStaleData,
  maskCardEnding,
} from "@/lib/allowance/format";
import { verifyPin } from "@/lib/allowance/pin";
import {
  clientIdentifier,
  getLockout,
  recordAttempt,
} from "@/lib/allowance/rate-limit";
import type { LookupResponse } from "@/lib/allowance/types";

const GENERIC_INVALID = "Card or PIN not recognized.";
const INACTIVE_MSG = "This card is no longer active. Contact program staff for help.";
const LOCKED_MSG = "Too many attempts. Please try again later.";
const ERROR_MSG = "Something went wrong. Please try again.";

export async function lookupAllowance(
  request: Request,
  last4: string,
  pin: string,
): Promise<LookupResponse> {
  const identifierHash = clientIdentifier(request);

  const lockout = await getLockout(identifierHash);
  if (lockout.locked) {
    return {
      ok: false,
      code: "locked",
      message: LOCKED_MSG,
      retryAfterSeconds: lockout.retryAfterSeconds,
    };
  }

  const supabase = getSupabaseAdmin();

  const { data: candidates, error } = await supabase
    .from("cards")
    .select("*")
    .eq("last_four", last4);

  if (error) {
    console.error("[allowance] lookup query failed");
    return { ok: false, code: "error", message: ERROR_MSG };
  }

  if (!candidates?.length) {
    await recordAttempt(identifierHash, false);
    return { ok: false, code: "invalid", message: GENERIC_INVALID };
  }

  let matched: CardRow | null = null;

  for (const card of candidates as CardRow[]) {
    const valid = await verifyPin(pin, card.pin_hash);
    if (valid) {
      matched = card;
      break;
    }
  }

  if (!matched) {
    await recordAttempt(identifierHash, false);
    return { ok: false, code: "invalid", message: GENERIC_INVALID };
  }

  if (!matched.active) {
    await recordAttempt(identifierHash, false);
    return { ok: false, code: "inactive", message: INACTIVE_MSG };
  }

  if (matched.allowance_cents < 0) {
    await recordAttempt(identifierHash, false);
    return { ok: false, code: "error", message: ERROR_MSG };
  }

  await recordAttempt(identifierHash, true);

  return {
    ok: true,
    cardEnding: maskCardEnding(matched.last_four),
    allowanceFormatted: formatAllowance(matched.allowance_cents, matched.currency),
    currency: matched.currency.toUpperCase(),
    updatedAt: formatUpdatedAt(matched.updated_at),
    stale: isStaleData(matched.updated_at),
  };
}
