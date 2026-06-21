const cols = [
  { label: "Product", href: "#product" },
  { label: "Thesis", href: "#thesis" },
  { label: "Pilot", href: "#pilot" },
  { label: "Join", href: "#join" },
];

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-ink py-12 sm:py-14">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-8 px-6 sm:flex-row">
        <div className="text-center sm:text-left">
          <div className="display text-xl font-bold tracking-[0.18em]">SHERWOOD</div>
          <p className="mt-2 max-w-xs text-sm text-cream/45">
            Programmable giving infrastructure for the people the financial system
            forgot.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
          {cols.map((c) => (
            <a
              key={c.href}
              href={c.href}
              className="text-sm text-cream/55 transition-colors hover:text-cream"
            >
              {c.label}
            </a>
          ))}
        </div>
      </div>

      <div className="mx-auto mt-10 flex max-w-7xl flex-col items-center justify-between gap-3 border-t border-white/5 px-6 pt-8 text-center text-xs leading-relaxed text-cream/35 sm:flex-row sm:text-left">
        <span>© {new Date().getFullYear()} Sherwood. Not charity. Infrastructure.</span>
        <span className="mono">The payment layer for human need.</span>
      </div>
    </footer>
  );
}
