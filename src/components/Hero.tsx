"use client";

import { LayoutGroup, motion } from "motion/react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { TextRotate } from "@/components/ui/text-rotate";
import { TrustedBadge } from "@/components/ui/testimonial";

const navLinks = [
  { label: "Build a brief", href: "#brief" },
  { label: "Services", href: "#services" },
  { label: "Formats", href: "#formats" },
  { label: "Instant quote", href: "/quote" },
  { label: "Contact", href: "#contact" },
];

const PRODUCTS = [
  "gummy.",
  "health drink.",
  "snack bar.",
  "powder blend.",
  "nootropic stack.",
  "functional bar.",
  "chewable tablet.",
  "effervescent.",
];

export default function Hero() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-[#d2d2d7]/50">
        <div className="max-w-[980px] mx-auto px-4 sm:px-6 flex items-center justify-between h-12">
          <Link href="/" className="flex items-center" aria-label="Label Origin">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.svg" alt="Label Origin" className="h-7 w-auto" />
          </Link>

          <div className="hidden md:flex items-center gap-7">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-xs text-[#86868b] hover:text-[#1d1d1f] transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            <a href="/login" className="text-xs text-[#86868b] hover:text-[#1d1d1f] transition-colors">
              Client login
            </a>
            <a href="#contact" className="text-xs text-[#0071e3] hover:underline">
              Work with us
            </a>
          </div>

          <button
            className="md:hidden text-[#1d1d1f]"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden bg-white border-t border-[#d2d2d7] px-6 py-4 space-y-3">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="block text-sm text-[#86868b] hover:text-[#1d1d1f]"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <a href="#contact" className="block text-sm text-[#0071e3]" onClick={() => setMenuOpen(false)}>
              Work with us
            </a>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="min-h-screen bg-white flex flex-col items-center justify-center px-4 sm:px-6 pt-12">
        <div className="max-w-[780px] mx-auto w-full text-center">

          {/* Eyebrow */}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-xs font-medium text-[#86868b] uppercase tracking-[0.25em] mb-8"
          >
            UK Contract Manufacturer
          </motion.p>

          {/* Headline with rotating word */}
          <LayoutGroup>
            <motion.h1
              layout
              className="text-[56px] sm:text-[72px] md:text-[88px] font-semibold tracking-tight text-[#1d1d1f] leading-[1.04] mb-8"
            >
              <motion.span
                layout
                transition={{ type: "spring", damping: 30, stiffness: 400 }}
              >
                {"Let's make a "}
              </motion.span>
              <br className="hidden sm:block" />
              <TextRotate
                texts={PRODUCTS}
                mainClassName="text-[#0071e3] overflow-hidden justify-center"
                staggerFrom="last"
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "-120%" }}
                staggerDuration={0.022}
                splitLevelClassName="overflow-hidden pb-1"
                transition={{ type: "spring", damping: 30, stiffness: 400 }}
                rotationInterval={2200}
              />
            </motion.h1>
          </LayoutGroup>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="text-xl md:text-2xl text-[#86868b] font-normal leading-relaxed max-w-xl mx-auto mb-12"
          >
            ISO9001 accredited. UK-manufactured. Independent QA on every batch.
            The functional wellness brand you are building, done properly.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex items-center justify-center gap-8"
          >
            <a href="#platform" className="text-[#0071e3] text-lg hover:underline">
              See our platform &gt;
            </a>
            <a href="#contact" className="text-[#0071e3] text-lg hover:underline">
              Work with us &gt;
            </a>
          </motion.div>

          {/* Trusted badge */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="flex justify-center mt-10"
          >
            <TrustedBadge />
          </motion.div>

          {/* Scroll hint */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.2 }}
            className="mt-16 flex justify-center"
          >
            <div className="w-px h-10 bg-gradient-to-b from-transparent to-[#d2d2d7]" />
          </motion.div>
        </div>
      </section>
    </>
  );
}
