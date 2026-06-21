import Reveal from "./Reveal";

export default function Movement() {
  return (
    <section className="relative overflow-hidden bg-cream py-24 text-ink sm:py-32 lg:py-36">
      <div className="pointer-events-none absolute inset-0 grid-bg-cream" />
      <div className="relative mx-auto max-w-5xl px-6">
        <Reveal>
          <p className="mono mb-6 text-xs tracking-[0.3em] text-green sm:mb-8">THE MOVEMENT</p>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="display text-balance text-4xl font-bold leading-[1.05] sm:text-5xl lg:text-6xl">
            Homelessness does not need another donation button.
            <br className="hidden sm:block" />
            <span className="text-green">It needs financial infrastructure.</span>
          </h2>
        </Reveal>
        <Reveal delay={0.2}>
          <div className="mt-8 grid max-w-3xl gap-5 text-base leading-relaxed text-ink/70 sm:mt-12 sm:gap-6 sm:text-lg">
            <p>
              Sherwood starts with a simple idea: if people could give with
              confidence, they would give more.
            </p>
            <p className="text-ink">
              We are building the payment layer for directed aid.
            </p>
          </div>
        </Reveal>
        <Reveal delay={0.3}>
          <div className="mt-8 inline-flex items-center gap-3 rounded-full border border-ink/15 bg-ink/[0.04] px-5 py-2.5 text-sm leading-snug text-ink/70 sm:mt-12">
            <span className="h-1.5 w-1.5 rounded-full bg-green" />
            Built for trust. Designed for dignity.
          </div>
        </Reveal>
      </div>
    </section>
  );
}
