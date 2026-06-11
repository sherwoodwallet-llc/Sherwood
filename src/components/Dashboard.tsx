"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  AnimatePresence,
  useInView,
  useMotionValue,
  animate,
  useReducedMotion,
} from "framer-motion";
import Reveal from "./Reveal";

const stats = [
  { label: "Total donated", value: 12480, prefix: "$", decimals: 0 },
  { label: "Active cards", value: 84, prefix: "", decimals: 0 },
  { label: "Approved transactions", value: 392, prefix: "", decimals: 0 },
  { label: "Restricted spend rate", value: 100, prefix: "", suffix: "%", decimals: 0 },
  { label: "Donor confidence score", value: 94, prefix: "", suffix: "%", decimals: 0 },
];

const feedPool = [
  { text: "$5 added to Card 1932", kind: "add" },
  { text: "$12.40 approved at Grocery Partner", kind: "ok" },
  { text: "$7.10 approved at Pharmacy", kind: "ok" },
  { text: "$20 added to Card 0427", kind: "add" },
  { text: "$3.25 approved at Transit", kind: "ok" },
  { text: "$15 added to Card 0581", kind: "add" },
  { text: "$9.80 approved at Hygiene Mart", kind: "ok" },
];

function Stat({
  label,
  value,
  prefix,
  suffix = "",
  decimals,
  play,
}: {
  label: string;
  value: number;
  prefix: string;
  suffix?: string;
  decimals: number;
  play: boolean;
}) {
  const mv = useMotionValue(0);
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!play) return;
    const c = animate(mv, value, {
      duration: 1.6,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (x) => setV(x),
    });
    return () => c.stop();
  }, [play, value, mv]);
  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-5">
      <div className="display text-3xl font-semibold text-cream sm:text-4xl">
        {prefix}
        {v.toLocaleString(undefined, {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        })}
        {suffix}
      </div>
      <div className="mt-2 text-xs uppercase tracking-wider text-cream/45">{label}</div>
    </div>
  );
}

export default function Dashboard() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-120px" });
  const reduce = useReducedMotion();
  const play = inView && !reduce;

  const [feed, setFeed] = useState(() => feedPool.slice(0, 4));
  const idx = useRef(4);

  useEffect(() => {
    if (reduce) return;
    const t = setInterval(() => {
      const next = feedPool[idx.current % feedPool.length];
      idx.current += 1;
      setFeed((prev) => [{ ...next, id: Math.random() }, ...prev].slice(0, 5) as never);
    }, 2600);
    return () => clearInterval(t);
  }, [reduce]);

  return (
    <section className="relative overflow-hidden py-28 sm:py-36">
      <div className="pointer-events-none absolute right-1/4 top-0 h-[36rem] w-[36rem] rounded-full bg-[radial-gradient(circle,rgba(212,177,95,0.1),transparent_65%)] blur-3xl" />
      <div ref={ref} className="mx-auto max-w-6xl px-6">
        <Reveal className="mb-14 text-center">
          <p className="mono mb-4 text-xs tracking-[0.3em] text-gold">PLATFORM DASHBOARD</p>
          <h2 className="display text-balance text-4xl font-bold sm:text-5xl lg:text-6xl">
            Every dollar, accounted for.
          </h2>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="card-panel overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/8 pb-5">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-red-400/70" />
                <span className="h-3 w-3 rounded-full bg-gold/70" />
                <span className="h-3 w-3 rounded-full bg-green-bright/70" />
                <span className="mono ml-3 text-xs text-cream/45">sherwood / overview</span>
              </div>
              <span className="flex items-center gap-2 text-xs text-green-bright">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-bright opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-green-bright" />
                </span>
                Live
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-6 sm:grid-cols-3 lg:grid-cols-5">
              {stats.map((s) => (
                <Stat
                  key={s.label}
                  label={s.label}
                  value={s.value}
                  prefix={s.prefix}
                  suffix={s.suffix}
                  decimals={s.decimals}
                  play={play}
                />
              ))}
            </div>

            <div className="mt-6 rounded-2xl border border-white/8 bg-ink/40 p-5">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm font-medium text-cream/80">Live feed</span>
                <span className="mono text-xs text-cream/40">real-time</span>
              </div>
              <ul className="space-y-2">
                <AnimatePresence initial={false}>
                  {feed.map((f, i) => (
                    <motion.li
                      key={(f as { id?: number }).id ?? f.text + i}
                      layout
                      initial={{ opacity: 0, y: -12, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: "auto" }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                      className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.03] px-4 py-3 text-sm"
                    >
                      <span className="flex items-center gap-3">
                        <span
                          className={`flex h-7 w-7 items-center justify-center rounded-full text-xs ${
                            f.kind === "ok"
                              ? "bg-green-bright/15 text-green-bright"
                              : "bg-gold/15 text-gold"
                          }`}
                        >
                          {f.kind === "ok" ? "✓" : "+"}
                        </span>
                        <span className="text-cream/80">{f.text}</span>
                      </span>
                      <span className="mono text-xs text-cream/35">now</span>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
