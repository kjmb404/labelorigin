"use client"

import { cn } from "@/lib/utils"

const testimonials = [
  {
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=600&h=600&auto=format&fit=crop",
    quote: "The final product exceeded our expectations and was delivered earlier than expected. We will 100% continue to work with them in the future.",
    name: "Emily Fitzgibbons",
    role: "Co-Founder, Mycologic",
  },
  {
    image: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=600",
    quote: "Label Origin handled a genuinely complex dual-extract mushroom formulation and got it right first time. The QA documentation was exactly what our retail buyers needed.",
    name: "James Hargreaves",
    role: "Founder, Dr Fungi",
  },
  {
    image: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=600",
    quote: "We came with a rough idea and they took us all the way to shelf. The formulation depth and category knowledge they brought was genuinely impressive.",
    name: "Tom Ashworth",
    role: "CEO, Super Tahr",
  },
]

export function TestimonialCards({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-wrap items-start justify-center gap-6", className)}>
      {testimonials.map((t) => (
        <div key={t.name} className="max-w-80 bg-[#1d1d1f] text-white rounded-2xl">
          <div className="relative -mt-px overflow-hidden rounded-2xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={t.image}
              alt={t.name}
              className="h-[270px] w-full rounded-2xl hover:scale-105 transition-all duration-300 object-cover object-top"
            />
            <div className="absolute bottom-0 z-10 h-60 w-full bg-gradient-to-t pointer-events-none from-[#1d1d1f] to-transparent" />
          </div>
          <div className="px-4 pb-4">
            <p className="font-medium border-b border-white/10 pb-5 text-sm leading-relaxed">
              &ldquo;{t.quote}&rdquo;
            </p>
            <p className="mt-4 text-sm">— {t.name}</p>
            <p className="text-xs font-medium text-white/50 mt-0.5">{t.role}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

export function TrustedBadge() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-0 pl-1 pr-3 py-1 rounded-full bg-white border border-[#d2d2d7] text-sm shadow-sm">
      <div className="flex items-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="w-[28px] h-[28px] rounded-full border-2 border-white object-cover"
          src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=50&h=50&auto=format&fit=crop"
          alt="Client"
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="w-[28px] h-[28px] rounded-full border-2 border-white object-cover -translate-x-2"
          src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=50"
          alt="Client"
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="w-[28px] h-[28px] rounded-full border-2 border-white object-cover -translate-x-4"
          src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=50"
          alt="Client"
        />
      </div>
      <p className="text-xs text-[#1d1d1f] font-medium -translate-x-3">
        Trusted by 50+ leading wellness brands
      </p>
    </div>
  )
}
