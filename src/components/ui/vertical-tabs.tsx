"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const STEPS = [
  {
    id: "1",
    title: "Fill out a contact form",
    content:
      "Tell us about your product idea, format, and timeline. Takes two minutes — we'll have everything we need to come back to you with a clear next step.",
  },
  {
    id: "2",
    title: "Book in a call",
    content:
      "A short discovery call with our NPD team. We'll cover formulation, volumes, lead times, and answer any questions — no obligation, no jargon.",
  },
  {
    id: "3",
    title: "Start your project",
    content:
      "Once you're happy to proceed, we lock in a brief and kick off formulation. From here, we handle everything through to delivery.",
  },
];

export default function VerticalTabs() {
  return (
    <section className="w-full bg-white py-24 md:py-32">
      <div className="max-w-[980px] mx-auto px-4 sm:px-6">
        <div className="mb-6">
          <h2 className="tracking-tight text-3xl font-semibold md:text-4xl lg:text-5xl text-foreground">
            How it works.
          </h2>
          <span className="text-[10px] font-medium text-muted uppercase tracking-[0.3em] block ml-0.5 mt-1">
            (Process)
          </span>
        </div>

        <p className="text-muted text-lg md:text-xl max-w-2xl mb-16">
          Three steps from idea to finished product.
        </p>

        <Accordion type="single" collapsible className="w-full -space-y-px" defaultValue="1">
          {STEPS.map((step) => (
            <AccordionItem
              value={step.id}
              key={step.id}
              className="border border-[#d2d2d7] bg-white px-6 py-1 first:rounded-t-2xl last:rounded-b-2xl"
            >
              <AccordionTrigger className="py-5 text-base font-semibold text-[#1d1d1f] hover:no-underline">
                <span className="flex items-center gap-4">
                  <span className="text-[11px] font-medium text-[#86868b] uppercase tracking-widest w-5 shrink-0">
                    {step.id.padStart(2, "0")}
                  </span>
                  {step.title}
                </span>
              </AccordionTrigger>
              <AccordionContent className="pb-5 text-[#86868b] leading-relaxed pl-9">
                {step.content}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
