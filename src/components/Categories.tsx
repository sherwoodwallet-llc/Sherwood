import Reveal from "./Reveal";

const allowed = ["Grocery", "Pharmacy", "Hygiene", "Transit", "Essential retail"];
const blocked = [
  "Cash withdrawals",
  "Liquor",
  "Gambling",
  "Tobacco",
  "Unapproved merchants",
];

function Check() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="shrink-0">
      <path
        d="M20 6 9 17l-5-5"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Cross() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="shrink-0">
      <path
        d="M18 6 6 18M6 6l12 12"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function Categories() {
  return (
    <section className="relative py-28 sm:py-36">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal className="mb-16 text-center">
          <p className="mono mb-4 text-xs tracking-[0.3em] text-gold">CONTROLLED LIQUIDITY</p>
          <h2 className="display mx-auto max-w-3xl text-balance text-4xl font-bold sm:text-5xl lg:text-6xl">
            Not cash. Not bureaucracy.{" "}
            <span className="text-gold-gradient">Controlled liquidity.</span>
          </h2>
        </Reveal>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Reveal>
            <div className="h-full rounded-3xl border border-green-bright/20 bg-gradient-to-b from-green-bright/10 to-transparent p-8">
              <div className="mb-6 flex items-center gap-3 text-green-bright">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-green-bright/15">
                  <Check />
                </span>
                <span className="display text-xl font-semibold">Allowed</span>
              </div>
              <ul className="space-y-3">
                {allowed.map((a) => (
                  <li
                    key={a}
                    className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.03] px-4 py-3 text-cream/80"
                  >
                    <span className="text-green-bright">
                      <Check />
                    </span>
                    {a}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <Reveal delay={0.12}>
            <div className="h-full rounded-3xl border border-red-500/15 bg-gradient-to-b from-red-500/10 to-transparent p-8">
              <div className="mb-6 flex items-center gap-3 text-red-400">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-red-500/15">
                  <Cross />
                </span>
                <span className="display text-xl font-semibold">Blocked</span>
              </div>
              <ul className="space-y-3">
                {blocked.map((b) => (
                  <li
                    key={b}
                    className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.03] px-4 py-3 text-cream/55 line-through decoration-red-400/40"
                  >
                    <span className="text-red-400 no-underline">
                      <Cross />
                    </span>
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
