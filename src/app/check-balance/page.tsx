"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import type { LookupResponse } from "@/lib/allowance/types";

type FormState = "idle" | "loading" | "success" | "invalid" | "locked" | "inactive" | "stale" | "offline" | "error";

function onlyDigits(value: string, max: number) {
  return value.replace(/\D/g, "").slice(0, max);
}

function statusCopy(state: FormState, result: LookupResponse | null) {
  if (state === "offline") return "You appear to be offline. Reconnect and try again.";
  if (state === "invalid") return "Card or PIN not recognized.";
  if (state === "locked") {
    if (result && !result.ok && result.code === "locked" && result.retryAfterSeconds) {
      const minutes = Math.max(1, Math.ceil(result.retryAfterSeconds / 60));
      return `Too many attempts. Try again in about ${minutes} minute${minutes === 1 ? "" : "s"}.`;
    }
    return "Too many attempts. Try again later.";
  }
  if (state === "inactive") return "This card is inactive. Ask staff for help.";
  if (state === "stale") return "Allowance shown, but this record may be stale. Ask staff if it looks wrong.";
  if (state === "error") return "Allowance lookup is unavailable. Try again soon.";
  return "Enter the last four digits and six-digit PIN on your card.";
}

export default function CheckBalancePage() {
  const [last4, setLast4] = useState("");
  const [pin, setPin] = useState("");
  const [state, setState] = useState<FormState>("idle");
  const [result, setResult] = useState<LookupResponse | null>(null);
  const [online, setOnline] = useState(true);

  useEffect(() => {
    setOnline(navigator.onLine);
    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  const canSubmit = useMemo(() => last4.length === 4 && pin.length === 6 && state !== "loading", [last4, pin, state]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setResult(null);

    if (!online) {
      setState("offline");
      return;
    }

    if (!canSubmit) {
      setState("invalid");
      return;
    }

    setState("loading");

    try {
      const response = await fetch("/api/allowance/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ last4, pin }),
      });
      const payload = (await response.json()) as LookupResponse;
      setResult(payload);

      if (payload.ok) {
        setState(payload.stale ? "stale" : "success");
        return;
      }

      if (payload.code === "locked") setState("locked");
      else if (payload.code === "inactive") setState("inactive");
      else if (payload.code === "invalid") setState("invalid");
      else setState("error");
    } catch {
      setState("offline");
    }
  }

  const success = result?.ok ? result : null;

  return (
    <main className="relative min-h-screen overflow-hidden bg-ink text-cream">
      <div className="pointer-events-none absolute inset-0 grid-bg" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-[42rem] w-[42rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(31,138,99,0.18),transparent_65%)] blur-3xl" />

      <section className="relative mx-auto flex min-h-screen w-full max-w-xl flex-col justify-center px-6 py-16">
        <a href="/" className="display mb-10 text-lg font-bold tracking-[0.18em] text-cream">
          SHERWOOD
        </a>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="card-panel"
        >
          <p className="mono mb-4 text-xs tracking-[0.3em] text-gold">ALLOWANCE LOOKUP</p>
          <h1 className="display text-balance text-4xl font-bold sm:text-5xl">
            Check your essential aid allowance.
          </h1>
          <p className="mt-5 text-sm leading-relaxed text-cream/55">
            This shows the program-assigned amount for your card. It is not a bank balance and does not move money.
          </p>

          <form onSubmit={onSubmit} className="mt-8 space-y-5">
            <div>
              <label htmlFor="last4" className="mb-2 block text-xs uppercase tracking-wider text-cream/45">
                Last four digits
              </label>
              <input
                id="last4"
                inputMode="numeric"
                autoComplete="cc-number"
                value={last4}
                onChange={(event) => setLast4(onlyDigits(event.target.value, 4))}
                placeholder="0427"
                className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-4 text-xl tracking-[0.35em] text-cream placeholder:text-cream/25 outline-none transition-colors focus:border-gold/50"
              />
            </div>

            <div>
              <label htmlFor="pin" className="mb-2 block text-xs uppercase tracking-wider text-cream/45">
                Six-digit PIN
              </label>
              <input
                id="pin"
                inputMode="numeric"
                autoComplete="one-time-code"
                type="password"
                value={pin}
                onChange={(event) => setPin(onlyDigits(event.target.value, 6))}
                placeholder="••••••"
                className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-4 text-xl tracking-[0.35em] text-cream placeholder:text-cream/25 outline-none transition-colors focus:border-gold/50"
              />
            </div>

            <button
              disabled={!canSubmit}
              className="w-full rounded-full bg-gold px-8 py-4 text-sm font-semibold text-ink glow-gold transition-opacity disabled:cursor-not-allowed disabled:opacity-45"
            >
              {state === "loading" ? "Checking..." : "Check Allowance"}
            </button>
          </form>

          <div
            className={`mt-6 rounded-2xl border px-4 py-4 text-sm ${
              state === "success"
                ? "border-green-bright/25 bg-green-bright/10 text-green-bright"
                : state === "stale"
                  ? "border-gold/25 bg-gold/10 text-gold"
                  : state === "idle"
                    ? "border-white/10 bg-white/[0.03] text-cream/50"
                    : "border-red-400/20 bg-red-500/10 text-red-200"
            }`}
          >
            {statusCopy(state, result)}
          </div>

          {success && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 rounded-3xl border border-white/10 bg-ink/50 p-6"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-cream/50">Card</span>
                <span className="mono text-cream">{success.cardEnding}</span>
              </div>
              <div className="mt-6">
                <div className="text-sm text-cream/50">Assigned allowance</div>
                <div className="display mt-2 text-5xl font-bold text-gold-gradient">
                  {success.allowanceFormatted}
                </div>
              </div>
              <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4 text-xs text-cream/45">
                <span>Last updated</span>
                <span>{success.updatedAt}</span>
              </div>
            </motion.div>
          )}
        </motion.div>

        <p className="mx-auto mt-8 max-w-sm text-center text-xs leading-relaxed text-cream/35">
          HTTPS only. Sherwood never asks for full card numbers, expiration dates, CVCs, or raw PIN storage.
        </p>
      </section>
    </main>
  );
}
