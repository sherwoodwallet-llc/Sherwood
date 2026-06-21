import { NextResponse } from "next/server";
import { getSupabaseAdmin, type CardRow } from "@/lib/supabase/admin";
import { generatePin, hashPin, isValidLastFour, isValidPin } from "@/lib/allowance/pin";
import type { SyncCardInput, SyncCardResult } from "@/lib/allowance/types";

export const runtime = "nodejs";

type SyncBody = {
  cards?: SyncCardInput[];
};

function unauthorized() {
  return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
}

function normalizeCurrency(value: unknown): string {
  return typeof value === "string" && /^[a-zA-Z]{3}$/.test(value) ? value.toLowerCase() : "usd";
}

function parseAllowance(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isInteger(value) || value < 0) return null;
  return value;
}

function validateCardInput(input: SyncCardInput): string | null {
  if (!input.stripe_card_id || typeof input.stripe_card_id !== "string") {
    return "Missing Stripe card ID.";
  }
  if (!isValidLastFour(input.last_four)) {
    return "Last four must be exactly 4 digits.";
  }
  if (parseAllowance(input.allowance_cents) === null) {
    return "Allowance must be a non-negative integer in cents.";
  }
  if (input.pin !== undefined && !isValidPin(input.pin)) {
    return "PIN must be exactly 6 digits.";
  }
  if (input.currency !== undefined && !/^[a-zA-Z]{3}$/.test(input.currency)) {
    return "Currency must be a 3-letter code.";
  }
  return null;
}

export async function POST(request: Request) {
  const configuredToken = process.env.ADMIN_SYNC_TOKEN;
  const auth = request.headers.get("authorization");

  if (!configuredToken || auth !== `Bearer ${configuredToken}`) {
    return unauthorized();
  }

  const body = (await request.json().catch(() => null)) as SyncBody | null;
  const cards = Array.isArray(body?.cards) ? body.cards : [];

  if (!cards.length) {
    return NextResponse.json({ ok: false, error: "No cards supplied." }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const results: SyncCardResult[] = [];

  for (const input of cards) {
    const validationError = validateCardInput(input);
    if (validationError) {
      results.push({
        stripe_card_id: input.stripe_card_id ?? "",
        last_four: input.last_four ?? "",
        status: "error",
        error: validationError,
      });
      continue;
    }

    const generatedPin = input.generate_pin ? generatePin() : undefined;
    const pinToHash = input.pin ?? generatedPin;

    const { data: existing, error: readError } = await supabase
      .from("cards")
      .select("id,pin_hash")
      .eq("stripe_card_id", input.stripe_card_id)
      .maybeSingle<Pick<CardRow, "id" | "pin_hash">>();

    if (readError) {
      results.push({
        stripe_card_id: input.stripe_card_id,
        last_four: input.last_four,
        status: "error",
        error: "Unable to read existing card.",
      });
      continue;
    }

    if (!existing && !pinToHash) {
      results.push({
        stripe_card_id: input.stripe_card_id,
        last_four: input.last_four,
        status: "error",
        error: "New cards require a PIN or generate_pin=true.",
      });
      continue;
    }

    const pin_hash = pinToHash ? await hashPin(pinToHash) : existing?.pin_hash;

    const { error: upsertError } = await supabase.from("cards").upsert(
      {
        stripe_card_id: input.stripe_card_id,
        last_four: input.last_four,
        pin_hash,
        allowance_cents: input.allowance_cents,
        currency: normalizeCurrency(input.currency),
        active: input.active ?? true,
      },
      { onConflict: "stripe_card_id" },
    );

    if (upsertError) {
      results.push({
        stripe_card_id: input.stripe_card_id,
        last_four: input.last_four,
        status: "error",
        error: "Unable to save card.",
      });
      continue;
    }

    await supabase.from("sync_logs").insert({
      stripe_card_id: input.stripe_card_id,
      action: existing ? (pinToHash ? "pin_reset" : "upsert") : "upsert",
    });

    results.push({
      stripe_card_id: input.stripe_card_id,
      last_four: input.last_four,
      status: existing ? "updated" : "created",
      pin_once: generatedPin ?? input.pin,
    });
  }

  return NextResponse.json(
    { ok: results.every((result) => result.status !== "error"), results },
    { headers: { "Cache-Control": "no-store" } },
  );
}
