"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";

const SherwoodCard3D = dynamic(() => import("./SherwoodCard3D"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center">
      <div className="h-44 w-72 animate-pulse rounded-2xl bg-gradient-to-br from-green/40 to-green/10" />
    </div>
  ),
});

const ease = [0.22, 1, 0.36, 1] as const;

export default function Hero() {
  return (
    <section id="top" className="relative min-h-screen overflow-hidden pt-32">
      <div className="pointer-events-none absolute inset-0 grid-bg" />
      {/* Cinematic radial glows */}
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[60rem] w-[60rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(31,138,99,0.22),transparent_60%)] blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-1/3 h-[40rem] w-[40rem] rounded-full bg-[radial-gradient(circle_at_center,rgba(212,177,95,0.16),transparent_60%)] blur-3xl" />

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-8 px-6 lg:grid-cols-2">
        <div className="z-10 pt-6 text-center lg:pt-0 lg:text-left">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs tracking-wide text-cream/70 backdrop-blur-sm"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-green-bright" />
            Not charity. Infrastructure.
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease, delay: 0.05 }}
            className="display text-5xl font-bold text-balance sm:text-6xl lg:text-7xl"
          >
            The future of giving is{" "}
            <span className="text-gold-gradient">programmable.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease, delay: 0.18 }}
            className="mx-auto mt-7 max-w-xl text-lg leading-relaxed text-cream/65 lg:mx-0"
          >
            Sherwood turns donations into restricted essential-use balances —
            giving people a way to help instantly without handing over cash.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease, delay: 0.3 }}
            className="mt-9 flex flex-col items-center gap-3 sm:flex-row lg:justify-start"
          >
            <a
              href="#join"
              className="group relative inline-flex items-center justify-center rounded-full bg-gold px-8 py-4 text-sm font-semibold text-ink transition-transform hover:scale-[1.04] glow-gold"
            >
              Join the Pilot
            </a>
            <a
              href="#product"
              className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-8 py-4 text-sm font-semibold text-cream backdrop-blur-sm transition-colors hover:bg-white/10"
            >
              See the Card
            </a>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="mono mt-8 text-xs tracking-widest text-cream/40"
          >
            GIVE INSTANTLY. SPEND INTENTIONALLY.
          </motion.p>
        </div>

        {/* 3D card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease, delay: 0.2 }}
          className="relative h-[420px] w-full sm:h-[520px] lg:h-[640px]"
        >
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/20 blur-3xl" />
          <SherwoodCard3D />
        </motion.div>
      </div>

      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent to-ink" />
    </section>
  );
}
