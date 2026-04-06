"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";

const services = [
  {
    value: "npd",
    label: "NPD",
    title: "New Product Development",
    description:
      "From category analysis and formulation brief through to prototype refinement and regulatory review. We run the full product development process so you can stay focused on brand and sales.",
    img: "https://images.unsplash.com/photo-1576086213369-97a306d36557?w=1400&auto=format&fit=crop&q=80",
    alt: "Scientist formulating a new wellness supplement in a UK laboratory",
  },
  {
    value: "branding",
    label: "Design",
    title: "Branding & Packaging",
    description:
      "Stand-out packaging and brand identity that communicates the quality of your product. Packaging that earns shelf space and consumer trust.",
    img: "https://images.unsplash.com/photo-1612817288484-6f916006741a?w=1400&auto=format&fit=crop&q=80",
    alt: "Premium wellness product packaging design",
  },
  {
    value: "manufacturing",
    label: "Production",
    title: "In-House Manufacturing",
    description:
      "ISO9001 accredited, UK-based manufacturing with full traceability. Complex active stacks handled with precision dosing and format integrity.",
    img: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=1400&auto=format&fit=crop&q=80",
    alt: "ISO9001 accredited UK manufacturing facility production line",
  },
  {
    value: "testing",
    label: "QA",
    title: "Third-Party Testing",
    description:
      "Every batch independently tested by UKAS-accredited labs. Full Certificate of Analysis — sharable with retailers and buyers.",
    img: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=1400&auto=format&fit=crop&q=80",
    alt: "UKAS-accredited laboratory quality assurance testing",
  },
];

export default function Services() {
  const [active, setActive] = useState("npd");
  const current = services.find((s) => s.value === active)!;

  return (
    <section id="services" className="py-24 md:py-32 bg-white">
      <div className="max-w-[980px] mx-auto px-4 sm:px-6">

        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-xs font-medium text-[#86868b] uppercase tracking-[0.3em] mb-3">
            (What we do)
          </p>
          <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-[#1d1d1f]">
            Services.
          </h2>
          <p className="text-[#86868b] text-lg mt-4">Everything you need to launch.</p>
        </div>

        {/* Card */}
        <div className="rounded-3xl overflow-hidden relative">

          {/* Image */}
          <div className="relative h-[380px] md:h-[480px] w-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="absolute inset-0"
              >
                <Image
                  src={current.img}
                  alt={current.alt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 980px) 100vw, 980px"
                  priority={active === "npd"}
                />
              </motion.div>
            </AnimatePresence>
            <div className="absolute inset-0 bg-gradient-to-t from-[#1d1d1f]/80 via-transparent to-transparent" />
          </div>

          {/* Tab panel */}
          <div className="absolute bottom-0 left-0 right-0 grid grid-cols-2 md:grid-cols-4 bg-[#1d1d1f]/70 backdrop-blur-md border-t border-white/10">
            {services.map((s) => (
              <button
                key={s.value}
                onClick={() => setActive(s.value)}
                className={`text-left p-5 border-r border-white/10 last:border-r-0 transition-all duration-200 cursor-pointer ${
                  active === s.value ? "opacity-100 bg-white/5" : "opacity-40 hover:opacity-70"
                }`}
              >
                <span className="block text-[10px] font-semibold text-[#0071e3] uppercase tracking-widest mb-1.5">
                  {s.label}
                </span>
                <h3 className="text-sm font-semibold text-white leading-snug mb-1.5">
                  {s.title}
                </h3>
                <p className="text-[11px] text-white/50 leading-relaxed line-clamp-2 hidden md:block">
                  {s.description}
                </p>
              </button>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
