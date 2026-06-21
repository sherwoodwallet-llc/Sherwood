"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const links = [
  { label: "Product", href: "#product" },
  { label: "Thesis", href: "#thesis" },
  { label: "Pilot", href: "#pilot" },
  { label: "Join", href: "#join" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-3 sm:px-6 sm:pt-4"
    >
      <nav
        className={`flex w-full max-w-6xl items-center justify-between rounded-full px-4 py-3 transition-all duration-500 sm:px-5 ${
          scrolled
            ? "border border-white/10 bg-ink/70 backdrop-blur-xl"
            : "border border-transparent bg-transparent"
        }`}
      >
        <a href="#top" className="display text-base font-bold tracking-[0.16em] text-cream sm:text-lg">
          SHERWOOD
        </a>

        <div className="hidden items-center gap-9 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm text-cream/65 transition-colors hover:text-cream"
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <a
            href="#join"
            className="hidden rounded-full bg-cream px-5 py-2.5 text-sm font-medium text-ink transition-transform hover:scale-[1.03] focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/70 sm:inline-block"
          >
            Request Access
          </a>
          <button
            aria-label="Menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5 transition-colors hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/70 md:hidden"
          >
            <div className="space-y-1">
              <span className="block h-0.5 w-4 bg-cream" />
              <span className="block h-0.5 w-4 bg-cream" />
            </div>
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-20 w-[calc(100%-2rem)] max-w-6xl rounded-2xl border border-white/10 bg-ink/95 p-5 shadow-2xl shadow-black/40 backdrop-blur-xl md:hidden"
          >
            <div className="flex flex-col gap-4">
              {links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-1 py-1 text-lg text-cream/80 transition-colors hover:text-cream"
                >
                  {l.label}
                </a>
              ))}
              <a
                href="#join"
                onClick={() => setOpen(false)}
                className="mt-2 rounded-full bg-cream px-5 py-3 text-center text-sm font-medium text-ink"
              >
                Request Access
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
