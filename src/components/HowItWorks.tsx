import Reveal from "./Reveal";

const steps = [
  {
    n: "01",
    title: "Tap",
    body: "A donor scans or taps a Sherwood card.",
  },
  {
    n: "02",
    title: "Allocate",
    body: "Funds enter the platform and are assigned to that card ID.",
  },
  {
    n: "03",
    title: "Spend",
    body: "The recipient uses the card at approved merchants.",
  },
  {
    n: "04",
    title: "Verify",
    body: "The platform shows where the donation was used.",
  },
];

export default function HowItWorks() {
  return (
    <section id="pilot" className="relative border-y border-white/5 bg-ink-soft py-24 sm:py-32 lg:py-36">
      <div className="mx-auto max-w-7xl px-6">
        <Reveal className="mb-12 max-w-3xl sm:mb-16">
          <p className="mono mb-4 text-xs tracking-[0.3em] text-gold">HOW IT WORKS</p>
          <h2 className="display text-balance text-4xl font-bold sm:text-5xl lg:text-6xl">
            Tap <span className="text-cream/40">→</span> Allocate{" "}
            <span className="text-cream/40">→</span> Spend{" "}
            <span className="text-cream/40">→</span> Verify
          </h2>
        </Reveal>

        <div className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/5 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <Reveal key={s.n} delay={i * 0.1}>
              <div className="group h-full bg-ink p-6 transition-colors hover:bg-green/20 sm:p-8">
                <div className="mono text-sm text-gold/70">{s.n}</div>
                <h3 className="display mt-6 text-2xl font-semibold text-cream">
                  {s.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-cream/55">{s.body}</p>
                <div className="mt-8 h-px w-full bg-gradient-to-r from-gold/40 to-transparent transition-all duration-500 group-hover:from-gold" />
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
