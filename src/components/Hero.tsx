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
    <section
      id="top"
      className="relative min-h-[calc(100svh-4rem)] overflow-hidden pt-20 pb-8 sm:pt-24 sm:pb-12 lg:pt-24 lg:pb-12"
    >
      <div className="pointer-events-none absolute inset-0 grid-bg" />
      {/* Cinematic radial glows */}
      <div className="pointer-events-none absolute -top-32 left-1/2 h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(31,138,99,0.22),transparent_60%)] blur-3xl sm:h-[44rem] sm:w-[44rem] lg:h-[54rem] lg:w-[54rem]" />
      <div className="pointer-events-none absolute right-0 top-1/3 h-[24rem] w-[24rem] rounded-full bg-[radial-gradient(circle_at_center,rgba(212,177,95,0.16),transparent_60%)] blur-3xl sm:h-[34rem] sm:w-[34rem]" />

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-6 px-6 sm:gap-8 lg:grid-cols-2 lg:gap-10">
        <div className="z-10 text-center lg:text-left">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease }}
            className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs tracking-wide text-cream/70 backdrop-blur-sm sm:mb-6"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-green-bright" />
            Not charity. Infrastructure.
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease, delay: 0.05 }}
            className="display mx-auto max-w-[20rem] text-4xl font-bold leading-[1.02] text-balance sm:max-w-3xl sm:text-6xl lg:mx-0 lg:text-7xl"
          >
            The future of giving is{" "}
            <span className="text-gold-gradient">programmable.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease, delay: 0.18 }}
            className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-cream/65 sm:mt-7 sm:text-lg lg:mx-0"
          >
            Sherwood turns donations into restricted essential-use balances —
            giving people a way to help instantly without handing over cash.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease, delay: 0.3 }}
            className="mt-7 flex flex-col items-center gap-3 sm:mt-9 sm:flex-row lg:justify-start"
          >
            <a
              href="#join"
              className="group relative inline-flex min-h-12 w-full max-w-xs items-center justify-center rounded-full bg-gold px-8 py-3.5 text-sm font-semibold text-ink transition-transform hover:scale-[1.04] focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/70 glow-gold sm:w-auto"
            >
              Join the Pilot
            </a>
            <a
              href="#product"
              className="inline-flex min-h-12 w-full max-w-xs items-center justify-center rounded-full border border-white/15 bg-white/5 px-8 py-3.5 text-sm font-semibold text-cream backdrop-blur-sm transition-colors hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/70 sm:w-auto"
            >
              See the Card
            </a>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="mono mt-6 text-xs tracking-widest text-cream/40 sm:mt-8"
          >
            GIVE INSTANTLY. SPEND INTENTIONALLY.
          </motion.p>
        </div>

        {/* 3D card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease, delay: 0.2 }}
          className="relative h-[220px] w-full sm:h-[360px] lg:h-[500px] xl:h-[560px]"
        >
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/20 blur-3xl" />
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 h-36 w-56 -translate-x-1/2 -translate-y-1/2 -rotate-6 rounded-2xl border border-gold/20 bg-gradient-to-br from-green-mid/50 via-green/40 to-ink opacity-[0.45] shadow-2xl shadow-green/30 sm:h-48 sm:w-80 lg:h-56 lg:w-96"
          >
            <div className="absolute left-5 top-5 text-xs font-bold tracking-[0.2em] text-cream/70 sm:text-sm">
              SHERWOOD
            </div>
            <div className="absolute bottom-5 left-5 h-7 w-10 rounded-md bg-gold/70 sm:h-9 sm:w-12" />
            <div className="absolute bottom-5 right-5 text-[10px] tracking-[0.2em] text-cream/45">
              0427
            </div>
          </div>
          <SherwoodCard3D />
        </motion.div>
      </div>

      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent to-ink" />
    </section>
  );
}
