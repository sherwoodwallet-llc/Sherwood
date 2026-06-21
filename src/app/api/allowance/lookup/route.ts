import { NextResponse } from "next/server";
import { getSupabaseAdmin, type CardRow } from "@/lib/supabase/admin";
import { formatAllowance, formatUpdatedAt, isStaleData, maskCardEnding } from "@/lib/allowance/format";
import { getLockout, clientIdentifier, recordAttempt } from "@/lib/allowance/rate-limit";
import { isValidLastFour, isValidPin, verifyPin } from "@/lib/allowance/pin";
import type { LookupResponse } from "@/lib/allowance/types";

export const runtime = "nodejs";

const GENERIC_INVALID = "Card or PIN not recognized.";

function json(body: LookupResponse, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "Referrer-Policy": "no-referrer",
    },
  });
}

export async function POST(request: Request) {
  const identifierHash = clientIdentifier(request);

  try {
    const lockout = await getLockout(identifierHash);
    if (lockout.locked) {
      return json(
        {
          ok: false,
          code: "locked",
          message: "Too many attempts. Try again later.",
          retryAfterSeconds: lockout.retryAfterSeconds,
        },
        429,
      );
    }

    const body = (await request.json().catch(() => null)) as {
      last4?: unknown;
      pin?: unknown;
    } | null;

    const last4 = typeof body?.last4 === "string" ? body.last4.trim() : "";
    const pin = typeof body?.pin === "string" ? body.pin.trim() : "";

    if (!isValidLastFour(last4) || !isValidPin(pin)) {
      await recordAttempt(identifierHash, false);
      return json({ ok: false, code: "invalid", message: GENERIC_INVALID }, 401);
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("cards")
      .select("id,stripe_card_id,last_four,pin_hash,allowance_cents,currency,active,updated_at,created_at")
      .eq("last_four", last4)
      .order("updated_at", { ascending: false })
      .returns<CardRow[]>();

    if (error) {
      return json({ ok: false, code: "error", message: "Allowance lookup unavailable." }, 503);
    }

    let matchedCard: CardRow | null = null;
    for (const card of data ?? []) {
      if (await verifyPin(pin, card.pin_hash)) {
        matchedCard = card;
        break;
      }
    }

    if (!matchedCard) {
      await recordAttempt(identifierHash, false);
      return json({ ok: false, code: "invalid", message: GENERIC_INVALID }, 401);
    }

    await recordAttempt(identifierHash, true);

    if (!matchedCard.active) {
      return json({
        ok: false,
        code: "inactive",
        message: "This card is inactive. Ask staff for help.",
      });
    }

    return json({
      ok: true,
      cardEnding: maskCardEnding(matchedCard.last_four),
      allowanceFormatted: formatAllowance(matchedCard.allowance_cents, matchedCard.currency),
      currency: matchedCard.currency.toUpperCase(),
      updatedAt: formatUpdatedAt(matchedCard.updated_at),
      stale: isStaleData(matchedCard.updated_at),
    });
  } catch {
    return json({ ok: false, code: "error", message: "Allowance lookup unavailable." }, 503);
  }
}
