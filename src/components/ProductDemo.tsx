"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useInView,
  useMotionValue,
  animate,
  useReducedMotion,
} from "framer-motion";
import Reveal from "./Reveal";

function CountUp({
  to,
  prefix = "$",
  decimals = 0,
  play,
}: {
  to: number;
  prefix?: string;
  decimals?: number;
  play: boolean;
}) {
  const mv = useMotionValue(0);
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!play) return;
    const controls = animate(mv, to, {
      duration: 1.4,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setVal(v),
    });
    return () => controls.stop();
  }, [play, to, mv]);
  return (
    <span className="mono tabular-nums">
      {prefix}
      {val.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
    </span>
  );
}

const float = (i: number) => ({
  animate: { y: [0, -12, 0] },
  transition: {
    duration: 5 + i,
    repeat: Infinity,
    ease: "easeInOut" as const,
    delay: i * 0.4,
  },
});

export default function ProductDemo() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-120px" });
  const reduce = useReducedMotion();
  const play = inView && !reduce;

  return (
    <section id="product" className="relative overflow-hidden py-28 sm:py-36">
      <div className="mx-auto max-w-7xl px-6">
        <Reveal className="mb-16 text-center">
          <p className="mono mb-4 text-xs tracking-[0.3em] text-gold">LIVE PRODUCT</p>
          <h2 className="display text-balance text-4xl font-bold sm:text-5xl lg:text-6xl">
            Watch a donation become directed aid.
          </h2>
        </Reveal>

        <div ref={ref} className="relative">
          {/* Spinning ghost card in background */}
          <motion.div
            aria-hidden
            animate={{ rotateY: 360 }}
            transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
            style={{ transformStyle: "preserve-3d" }}
            className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-[28rem] -translate-x-1/2 -translate-y-1/2 rounded-3xl bg-gradient-to-br from-green-mid/30 to-green/5 blur-2xl"
          />

          <div className="relative grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* Card 1 — Donate */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={play ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              <motion.div {...float(0)} className="card-panel">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-widest text-cream/45">
                    Donate
                  </span>
                  <span className="rounded-full bg-white/5 px-2 py-1 text-[10px] text-cream/50">
                    Donor
                  </span>
                </div>
                <div className="mt-6 text-4xl font-semibold text-cream">
                  <CountUp to={10} play={play} />
                </div>
                <p className="mono mt-2 text-sm text-cream/50">sent to Card 0427</p>
                <div className="mt-6 h-px w-full bg-white/10" />
                <p className="mt-4 text-sm text-cream/55">
                  One tap. No cash. No friction.
                </p>
              </motion.div>
            </motion.div>

            {/* Card 2 — Allocated */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={play ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.25 }}
            >
              <motion.div {...float(1)} className="card-panel">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-widest text-cream/45">
                    Allocated
                  </span>
                  <span className="rounded-full bg-gold/15 px-2 py-1 text-[10px] text-gold">
                    Wallet
                  </span>
                </div>
                <div className="mt-6 text-sm text-cream/55">Essentials balance</div>
                <div className="mt-2 text-4xl font-semibold text-gold">
                  <CountUp to={10} play={play} />
                </div>
                <div className="mt-6 h-2 w-full overflow-hidden rounded-full bg-white/10">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={play ? { width: "100%" } : {}}
                    transition={{ duration: 1.4, delay: 0.3, ease: "easeOut" }}
                    className="h-full rounded-full bg-gradient-to-r from-gold to-gold-bright"
                  />
                </div>
                <p className="mt-4 text-sm text-cream/55">
                  Balance added to essentials wallet.
                </p>
              </motion.div>
            </motion.div>

            {/* Card 3 — Approved */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={play ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.5 }}
            >
              <motion.div {...float(2)} className="card-panel">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-widest text-cream/45">
                    Approved
                  </span>
                  <motion.span
                    initial={{ backgroundColor: "rgba(255,255,255,0.05)", color: "#8a8a82" }}
                    animate={
                      play
                        ? { backgroundColor: "rgba(31,138,99,0.18)", color: "#3fcf8e" }
                        : {}
                    }
                    transition={{ duration: 0.6, delay: 1.6 }}
                    className="rounded-full px-2 py-1 text-[10px]"
                  >
                    ● Approved
                  </motion.span>
                </div>
                <div className="mt-6 text-4xl font-semibold text-cream">
                  <CountUp to={8.42} decimals={2} play={play} />
                </div>
                <p className="mono mt-2 text-sm text-cream/50">at Grocery Partner</p>
                <motion.div
                  initial={{ opacity: 0.2 }}
                  animate={play ? { opacity: 1 } : {}}
                  transition={{ delay: 1.6, duration: 0.5 }}
                  className="mt-6 flex items-center gap-2 rounded-xl border border-green-bright/30 bg-green-bright/10 px-3 py-2.5 text-sm text-green-bright"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M20 6 9 17l-5-5"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Verified essential spend
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
