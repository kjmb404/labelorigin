"use client";

import { AnimatedFeatureCard } from "@/components/ui/feature-card-1";

const features = [
  {
    index: "001",
    tag: "Formulation",
    title: "Bespoke active stacks formulated by our in-house technical team — capsules, gummies, powders and more.",
    imageSrc: "https://images.unsplash.com/photo-1576086213369-97a306d36557?w=800&auto=format&fit=crop&q=80",
    color: "green" as const,
  },
  {
    index: "002",
    tag: "Manufacturing",
    title: "ISO 9001 accredited, UK-based GMP manufacturing. 500 to 500,000 units with full batch traceability.",
    imageSrc: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&auto=format&fit=crop&q=80",
    color: "blue" as const,
  },
  {
    index: "003",
    tag: "Full Service",
    title: "NPD strategy, label design, UKAS-accredited QA and fulfilment — everything under one roof.",
    imageSrc: "https://images.unsplash.com/photo-1532094349884-543559b4420e?w=800&auto=format&fit=crop&q=80",
    color: "dark" as const,
  },
];

export default function Services() {
  return (
    <section id="services" className="py-24 md:py-32 bg-[#f5f5f7]">
      <div className="max-w-[980px] mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <p className="text-xs font-medium text-[#86868b] uppercase tracking-[0.3em] mb-3">
            (What we do)
          </p>
          <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-[#1d1d1f]">
            Services.
          </h2>
          <p className="text-[#86868b] text-lg mt-4">
            Everything you need to launch — under one roof.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 justify-items-center">
          {features.map((feature) => (
            <AnimatedFeatureCard
              key={feature.index}
              index={feature.index}
              tag={feature.tag}
              title={feature.title}
              imageSrc={feature.imageSrc}
              color={feature.color}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
