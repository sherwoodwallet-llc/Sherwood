"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Reveal from "./Reveal";

const roles = ["Donor", "Nonprofit", "Merchant", "Builder", "Investor"];

export default function Waitlist() {
  const [role, setRole] = useState("Donor");
  const [submitted, setSubmitted] = useState(false);

  return (
    <section id="join" className="relative overflow-hidden py-28 sm:py-40">
      <div className="pointer-events-none absolute left-1/2 top-0 h-[40rem] w-[40rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(31,138,99,0.16),transparent_65%)] blur-3xl" />
      <div className="relative mx-auto max-w-3xl px-6">
        <Reveal className="mb-12 text-center">
          <p className="mono mb-4 text-xs tracking-[0.3em] text-gold">WAITLIST</p>
          <h2 className="display text-balance text-4xl font-bold sm:text-5xl lg:text-6xl">
            Help build the first programmable aid network.
          </h2>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="card-panel">
            {submitted ? (
              <div className="flex flex-col items-center py-12 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-bright/15 text-green-bright">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M20 6 9 17l-5-5"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <h3 className="display mt-6 text-2xl font-semibold">You&apos;re on the list.</h3>
                <p className="mt-2 max-w-sm text-cream/60">
                  We&apos;ll reach out as the pilot opens. Welcome to the payment layer
                  for human need.
                </p>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setSubmitted(true);
                }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-xs uppercase tracking-wider text-cream/45">
                      Name
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="Jane Doe"
                      className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-cream placeholder:text-cream/30 outline-none transition-colors focus:border-gold/50"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-xs uppercase tracking-wider text-cream/45">
                      Email
                    </label>
                    <input
                      required
                      type="email"
                      placeholder="jane@email.com"
                      className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-cream placeholder:text-cream/30 outline-none transition-colors focus:border-gold/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-3 block text-xs uppercase tracking-wider text-cream/45">
                    I am a
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {roles.map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setRole(r)}
                        className={`rounded-full border px-4 py-2 text-sm transition-all ${
                          role === r
                            ? "border-gold bg-gold text-ink"
                            : "border-white/10 bg-white/[0.03] text-cream/70 hover:border-white/25"
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-xs uppercase tracking-wider text-cream/45">
                    Message
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Tell us why you want in."
                    className="w-full resize-none rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-cream placeholder:text-cream/30 outline-none transition-colors focus:border-gold/50"
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="w-full rounded-full bg-gold px-8 py-4 text-sm font-semibold text-ink glow-gold"
                >
                  Request Access
                </motion.button>
              </form>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
