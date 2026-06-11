"use client";

const items = [
  "A card for essential aid.",
  "Give instantly. Spend intentionally.",
  "Directed giving, without the bureaucracy.",
  "The payment layer for human need.",
  "A new financial rail for street-level aid.",
  "Built for trust. Designed for dignity.",
  "Not charity. Infrastructure.",
];

export default function Ticker() {
  const row = [...items, ...items];
  return (
    <div className="relative border-y border-white/10 bg-ink-soft py-5">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-ink to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-ink to-transparent" />
      <div className="flex w-max animate-marquee gap-10 whitespace-nowrap">
        {row.map((t, i) => (
          <span key={i} className="flex items-center gap-10 text-sm tracking-wide text-cream/55">
            <span className="text-gold">✦</span>
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}
