import Reveal from "./Reveal";

export default function Thesis() {
  return (
    <section id="thesis" className="relative overflow-hidden py-24 sm:py-32 lg:py-36">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[28rem] w-[28rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(31,138,99,0.12),transparent_65%)] blur-3xl sm:h-[40rem] sm:w-[40rem]" />
      <div className="relative mx-auto max-w-5xl px-6 text-center">
        <Reveal>
          <p className="mono mb-6 text-xs tracking-[0.3em] text-gold sm:mb-8">THE CONTRARIAN THESIS</p>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="display mx-auto max-w-4xl text-balance text-4xl font-bold leading-[1.05] sm:text-6xl lg:text-7xl">
            People are not less generous.
            <br className="hidden sm:block" />
            <span className="text-cream/40">
              The system just makes giving feel stupid.
            </span>
          </h2>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="mx-auto mt-8 max-w-2xl text-base leading-relaxed text-cream/60 sm:mt-10 sm:text-lg">
            Cash creates doubt. Institutions create delay. Sherwood creates a new
            layer:{" "}
            <span className="text-cream">instant, directed, dignified aid.</span>
          </p>
        </Reveal>
      </div>
    </section>
  );
}
