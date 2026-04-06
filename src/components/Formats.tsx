"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface IconProps { size?: number; className?: string; }

// Gummy — soft-chew oval with score marks
function GummyIcon({ size = 48, className }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={cn("", className)} style={{ width: size, height: size }}>
      <ellipse cx="24" cy="25" rx="12" ry="14" fill="#f0f0f0" stroke="#1d1d1f" strokeWidth="1.8" />
      <ellipse cx="24" cy="25" rx="7" ry="9" stroke="#1d1d1f" strokeWidth="1.2" strokeDasharray="2 2" opacity="0.35" />
      <path d="M19 13 Q24 9 29 13" stroke="#1d1d1f" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <circle cx="20" cy="21" r="1.2" fill="#1d1d1f" opacity="0.25" />
      <circle cx="28" cy="29" r="1.2" fill="#1d1d1f" opacity="0.25" />
    </svg>
  );
}

// Powder Blend — measuring scoop
function PowderIcon({ size = 48, className }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={cn("", className)} style={{ width: size, height: size }}>
      <path d="M12 20 Q12 34 24 34 Q36 34 36 20 L33 16 H15 Z" fill="#f0f0f0" stroke="#1d1d1f" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M15 16 H33" stroke="#1d1d1f" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M33 16 L40 10" stroke="#1d1d1f" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M14 24 Q24 28 34 24" stroke="#1d1d1f" strokeWidth="1.2" strokeLinecap="round" opacity="0.3" />
      <path d="M13 29 Q24 33 35 29" stroke="#1d1d1f" strokeWidth="1.2" strokeLinecap="round" opacity="0.2" />
    </svg>
  );
}

// Health Drink — slim RTD bottle
function DrinkIcon({ size = 48, className }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={cn("", className)} style={{ width: size, height: size }}>
      <rect x="20" y="7" width="8" height="4" rx="1" fill="#f0f0f0" stroke="#1d1d1f" strokeWidth="1.6" />
      <path d="M20 11 L17 16 L17 38 Q17 40 20 40 L28 40 Q31 40 31 38 L31 16 L28 11 Z" fill="#f0f0f0" stroke="#1d1d1f" strokeWidth="1.8" strokeLinejoin="round" />
      <rect x="17" y="22" width="14" height="10" rx="1" fill="#1d1d1f" opacity="0.06" />
      <path d="M20 26 H28" stroke="#1d1d1f" strokeWidth="1.2" strokeLinecap="round" opacity="0.3" />
      <path d="M21 29 H27" stroke="#1d1d1f" strokeWidth="1" strokeLinecap="round" opacity="0.2" />
    </svg>
  );
}

// Functional Bar — protein bar with segments
function BarIcon({ size = 48, className }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={cn("", className)} style={{ width: size, height: size }}>
      <rect x="8" y="17" width="32" height="14" rx="3" fill="#f0f0f0" stroke="#1d1d1f" strokeWidth="1.8" />
      <line x1="17" y1="17" x2="17" y2="31" stroke="#1d1d1f" strokeWidth="1.4" opacity="0.3" />
      <line x1="24" y1="17" x2="24" y2="31" stroke="#1d1d1f" strokeWidth="1.4" opacity="0.3" />
      <line x1="31" y1="17" x2="31" y2="31" stroke="#1d1d1f" strokeWidth="1.4" opacity="0.3" />
      <path d="M10 17 Q12 14 16 15 Q20 13 24 15 Q28 13 32 15 Q36 14 38 17" stroke="#1d1d1f" strokeWidth="1.4" strokeLinecap="round" fill="none" opacity="0.5" />
    </svg>
  );
}

// Effervescent — tablet with fizz lines
function EffervescentIcon({ size = 48, className }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={cn("", className)} style={{ width: size, height: size }}>
      <rect x="14" y="20" width="20" height="14" rx="7" fill="#f0f0f0" stroke="#1d1d1f" strokeWidth="1.8" />
      <line x1="14" y1="27" x2="34" y2="27" stroke="#1d1d1f" strokeWidth="1.2" opacity="0.3" />
      {/* fizz marks */}
      <motion.g animate={{ y: [0, -2, 0] }} transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut", delay: 0 }}>
        <line x1="21" y1="17" x2="21" y2="13" stroke="#1d1d1f" strokeWidth="1.4" strokeLinecap="round" opacity="0.5" />
      </motion.g>
      <motion.g animate={{ y: [0, -2, 0] }} transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}>
        <line x1="27" y1="17" x2="27" y2="14" stroke="#1d1d1f" strokeWidth="1.4" strokeLinecap="round" opacity="0.4" />
      </motion.g>
      <motion.g animate={{ y: [0, -2, 0] }} transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}>
        <line x1="24" y1="16" x2="24" y2="12" stroke="#1d1d1f" strokeWidth="1.4" strokeLinecap="round" opacity="0.6" />
      </motion.g>
    </svg>
  );
}

// Chewable Tablet — scored round tablet
function ChewableIcon({ size = 48, className }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={cn("", className)} style={{ width: size, height: size }}>
      <circle cx="24" cy="24" r="14" fill="#f0f0f0" stroke="#1d1d1f" strokeWidth="1.8" />
      <line x1="10" y1="24" x2="38" y2="24" stroke="#1d1d1f" strokeWidth="1.4" strokeLinecap="round" opacity="0.35" />
      <line x1="24" y1="10" x2="24" y2="38" stroke="#1d1d1f" strokeWidth="1.4" strokeLinecap="round" opacity="0.35" />
      <circle cx="24" cy="24" r="4" fill="#1d1d1f" opacity="0.08" />
    </svg>
  );
}

// Capsule — classic two-part hard-shell capsule
function CapsuleIcon({ size = 48, className }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={cn("", className)} style={{ width: size, height: size }}>
      {/* left half */}
      <path d="M10 20 Q10 12 18 12 L24 12 L24 36 L18 36 Q10 36 10 28 Z" fill="#1d1d1f" opacity="0.12" stroke="#1d1d1f" strokeWidth="1.8" strokeLinejoin="round" />
      {/* right half */}
      <path d="M38 20 Q38 12 30 12 L24 12 L24 36 L30 36 Q38 36 38 28 Z" fill="#f0f0f0" stroke="#1d1d1f" strokeWidth="1.8" strokeLinejoin="round" />
      {/* join line */}
      <line x1="24" y1="12" x2="24" y2="36" stroke="#1d1d1f" strokeWidth="1.4" />
    </svg>
  );
}

// Nootropic Stack — stacked capsule layers
function NootropicIcon({ size = 48, className }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={cn("", className)} style={{ width: size, height: size }}>
      {/* three stacked oval pills */}
      <rect x="10" y="30" width="28" height="9" rx="4.5" fill="#f0f0f0" stroke="#1d1d1f" strokeWidth="1.7" />
      <line x1="24" y1="30" x2="24" y2="39" stroke="#1d1d1f" strokeWidth="1.2" opacity="0.3" />

      <rect x="10" y="20" width="28" height="9" rx="4.5" fill="#f0f0f0" stroke="#1d1d1f" strokeWidth="1.7" />
      <line x1="24" y1="20" x2="24" y2="29" stroke="#1d1d1f" strokeWidth="1.2" opacity="0.3" />

      <rect x="10" y="10" width="28" height="9" rx="4.5" fill="#1d1d1f" opacity="0.1" stroke="#1d1d1f" strokeWidth="1.7" />
      <line x1="24" y1="10" x2="24" y2="19" stroke="#1d1d1f" strokeWidth="1.2" opacity="0.3" />
    </svg>
  );
}

const FORMATS = [
  { name: "Gummy",          Icon: GummyIcon,         desc: "Vegan · Gelatine · Sugar-free"          },
  { name: "Powder Blend",   Icon: PowderIcon,         desc: "Nootropic · Pre-workout · Collagen"     },
  { name: "Health Drink",   Icon: DrinkIcon,          desc: "RTD · Concentrate · Shot"               },
  { name: "Functional Bar", Icon: BarIcon,            desc: "Protein · Energy · Recovery"            },
  { name: "Effervescent",   Icon: EffervescentIcon,   desc: "Tablet · Sachet · Stick"                },
  { name: "Chewable Tablet",Icon: ChewableIcon,       desc: "Pressed · Soft · Coated"                },
  { name: "Capsule",        Icon: CapsuleIcon,        desc: "Hard shell · HPMC · Softgel"            },
  { name: "Nootropic Stack",Icon: NootropicIcon,      desc: "Complex · Adaptogenic · Dual-extract"   },
];

export default function Formats() {
  return (
    <section id="formats" className="py-24 md:py-32 bg-[#f5f5f7]">
      <div className="max-w-[980px] mx-auto px-4 sm:px-6">
        <div className="text-center mb-6">
          <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-[#1d1d1f]">
            Every format.
          </h2>
        </div>
        <p className="text-center text-[#86868b] text-lg md:text-xl max-w-2xl mx-auto mb-16">
          From complex gummy matrices to powder blends and nootropic stacks — one partner for all of it.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 justify-items-center">
          {FORMATS.map(({ name, Icon, desc }) => (
            <motion.div
              key={name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ type: "spring", stiffness: 120, damping: 14 }}
              className="flex flex-col items-center gap-3 w-full"
            >
              <div className="flex items-center justify-center w-20 h-20 rounded-2xl border border-[#d2d2d7] bg-white">
                <Icon size={48} />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-[#1d1d1f]">{name}</p>
                <p className="text-[11px] text-[#86868b] mt-0.5 leading-tight">{desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
