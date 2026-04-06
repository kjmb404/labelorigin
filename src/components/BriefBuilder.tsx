"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

const FORMATS = [
  { id: "gummy", label: "Gummy", capabilities: ["Vegan & gelatine matrices", "Up to 12 actives per piece", "Vegan Society approved", "Complex active stacks"] },
  { id: "powder", label: "Powder Blend", capabilities: ["Precise micro-dosing", "Flavour masking technology", "Sachet or tub formats", "Free-flow blending"] },
  { id: "health-drink", label: "Health Drink", capabilities: ["RTD and concentrate formats", "Natural flavour inclusion", "Functional active blending", "Custom packaging"] },
  { id: "functional-bar", label: "Functional Bar", capabilities: ["Cold and warm process", "Protein matrix expertise", "Prebiotic inclusion", "Custom coating options"] },
  { id: "effervescent", label: "Effervescent", capabilities: ["CO₂ tablet pressing", "Moisture-controlled production", "Custom flavour profiles", "Tube or sachet formats"] },
  { id: "chewable", label: "Chewable Tablet", capabilities: ["Direct compression", "Chewable matrix", "Flavoured active masking", "Child-friendly options"] },
  { id: "capsule", label: "Capsule", capabilities: ["HPMC or gelatine shell", "Powder and liquid fill", "Blister or bottle pack", "High active load"] },
  { id: "nootropic", label: "Nootropic Stack", capabilities: ["Multi-active blending", "Bioavailability optimisation", "Premium ingredient sourcing", "Clinical-level dosing"] },
];

const VOLUMES = [
  {
    id: "startup",
    label: "Startup",
    range: "1,000 – 5,000 units",
    leadTime: "10 – 14 weeks",
    description: "Brand launches, DTC testing and initial retail pitches.",
  },
  {
    id: "scale",
    label: "Scale",
    range: "5,000 – 25,000 units",
    leadTime: "8 – 12 weeks",
    description: "Growing brands committing to retail listings and repeat orders.",
  },
  {
    id: "retail",
    label: "Retail Ready",
    range: "25,000+ units",
    leadTime: "6 – 10 weeks",
    description: "Established brands with confirmed retail or e-commerce volume.",
  },
];

const TIMELINES = [
  { id: "asap", label: "ASAP", sub: "Under 8 weeks", note: "We'll explore rush scheduling and prioritise your project intake." },
  { id: "3months", label: "3 months", sub: "8 – 16 weeks", note: "Standard lead time — ideal fit for most formats and volumes." },
  { id: "6months", label: "6+ months", sub: "No rush", note: "We can plan formulation trials and sampling well in advance." },
];

type Brief = {
  format: string;
  volume: string;
  timeline: string;
};

export default function BriefBuilder() {
  const [step, setStep] = useState(0);
  const [brief, setBrief] = useState<Brief>({ format: "", volume: "", timeline: "" });
  const [done, setDone] = useState(false);

  const selectedFormat = FORMATS.find((f) => f.id === brief.format);
  const selectedVolume = VOLUMES.find((v) => v.id === brief.volume);
  const selectedTimeline = TIMELINES.find((t) => t.id === brief.timeline);

  function saveBriefAndScroll() {
    if (typeof window !== "undefined") {
      localStorage.setItem(
        "lo_brief",
        JSON.stringify({
          format: selectedFormat?.label ?? "",
          volume: selectedVolume?.range ?? "",
          timeline: selectedTimeline?.label ?? "",
        })
      );
      window.dispatchEvent(new Event("lo_brief_ready"));
    }
    setDone(true);
    setTimeout(() => {
      document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
    }, 400);
  }

  const steps = ["Format", "Volume", "Timeline"];

  return (
    <section id="brief" className="py-24 md:py-32 bg-white">
      <div className="max-w-[980px] mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="mb-12 text-center">
          <p className="text-xs font-medium text-[#86868b] uppercase tracking-[0.3em] mb-3">
            (Product Brief)
          </p>
          <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-[#1d1d1f]">
            Build your brief.
          </h2>
          <p className="text-[#86868b] text-lg mt-4 max-w-lg mx-auto">
            Three questions. We'll tell you exactly what to expect.
          </p>
        </div>

        {/* Progress */}
        {!done && (
          <div className="flex items-center justify-center gap-3 mb-10">
            {steps.map((s, i) => (
              <div key={s} className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-semibold transition-all duration-300 ${
                      i < step
                        ? "bg-[#0071e3] text-white"
                        : i === step
                        ? "bg-[#1d1d1f] text-white"
                        : "bg-[#f5f5f7] text-[#86868b]"
                    }`}
                  >
                    {i < step ? (
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      i + 1
                    )}
                  </div>
                  <span className={`text-xs font-medium ${i === step ? "text-[#1d1d1f]" : "text-[#86868b]"}`}>{s}</span>
                </div>
                {i < steps.length - 1 && <div className="w-8 h-px bg-[#d2d2d7]" />}
              </div>
            ))}
          </div>
        )}

        {/* Steps */}
        <AnimatePresence mode="wait">
          {!done ? (
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
            >
              {/* Step 0: Format */}
              {step === 0 && (
                <div>
                  <p className="text-center text-sm text-[#86868b] mb-6">What are you looking to make?</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {FORMATS.map((f) => (
                      <button
                        key={f.id}
                        onClick={() => {
                          setBrief((b) => ({ ...b, format: f.id }));
                          setTimeout(() => setStep(1), 180);
                        }}
                        className={`rounded-2xl border px-4 py-5 text-left transition-all duration-200 hover:border-[#0071e3] hover:bg-[#0071e3]/5 group ${
                          brief.format === f.id
                            ? "border-[#0071e3] bg-[#0071e3]/5"
                            : "border-[#d2d2d7] bg-[#f5f5f7]"
                        }`}
                      >
                        <span className="block text-sm font-semibold text-[#1d1d1f] group-hover:text-[#0071e3] transition-colors">
                          {f.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 1: Volume */}
              {step === 1 && (
                <div>
                  <p className="text-center text-sm text-[#86868b] mb-6">What volume are you targeting?</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {VOLUMES.map((v) => (
                      <button
                        key={v.id}
                        onClick={() => {
                          setBrief((b) => ({ ...b, volume: v.id }));
                          setTimeout(() => setStep(2), 180);
                        }}
                        className={`rounded-2xl border p-6 text-left transition-all duration-200 hover:border-[#0071e3] hover:bg-[#0071e3]/5 ${
                          brief.volume === v.id
                            ? "border-[#0071e3] bg-[#0071e3]/5"
                            : "border-[#d2d2d7] bg-[#f5f5f7]"
                        }`}
                      >
                        <span className="block text-base font-semibold text-[#1d1d1f] mb-1">{v.label}</span>
                        <span className="block text-xs font-medium text-[#0071e3] mb-2">{v.range}</span>
                        <span className="block text-xs text-[#86868b] leading-relaxed">{v.description}</span>
                      </button>
                    ))}
                  </div>
                  <button onClick={() => setStep(0)} className="mt-5 block mx-auto text-xs text-[#86868b] hover:text-[#1d1d1f] transition-colors">
                    ← Back
                  </button>
                </div>
              )}

              {/* Step 2: Timeline */}
              {step === 2 && (
                <div>
                  <p className="text-center text-sm text-[#86868b] mb-6">What's your timeline?</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {TIMELINES.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => {
                          setBrief((b) => ({ ...b, timeline: t.id }));
                          setTimeout(() => setStep(3), 180);
                        }}
                        className={`rounded-2xl border p-6 text-left transition-all duration-200 hover:border-[#0071e3] hover:bg-[#0071e3]/5 ${
                          brief.timeline === t.id
                            ? "border-[#0071e3] bg-[#0071e3]/5"
                            : "border-[#d2d2d7] bg-[#f5f5f7]"
                        }`}
                      >
                        <span className="block text-base font-semibold text-[#1d1d1f] mb-0.5">{t.label}</span>
                        <span className="block text-xs font-medium text-[#0071e3] mb-2">{t.sub}</span>
                        <span className="block text-xs text-[#86868b] leading-relaxed">{t.note}</span>
                      </button>
                    ))}
                  </div>
                  <button onClick={() => setStep(1)} className="mt-5 block mx-auto text-xs text-[#86868b] hover:text-[#1d1d1f] transition-colors">
                    ← Back
                  </button>
                </div>
              )}

              {/* Step 3: Summary */}
              {step === 3 && selectedFormat && selectedVolume && selectedTimeline && (
                <div className="max-w-[640px] mx-auto">
                  <p className="text-center text-sm text-[#86868b] mb-6">Here's what we can do for you.</p>
                  <div className="rounded-3xl border border-[#d2d2d7] overflow-hidden">
                    {/* Header bar */}
                    <div className="bg-[#1d1d1f] px-8 py-6 flex items-center justify-between">
                      <div>
                        <p className="text-white/50 text-xs uppercase tracking-widest mb-1">Your brief</p>
                        <p className="text-white text-lg font-semibold">{selectedFormat.label}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-white/50 text-xs uppercase tracking-widest mb-1">Est. lead time</p>
                        <p className="text-[#0071e3] text-lg font-semibold">{selectedVolume.leadTime}</p>
                      </div>
                    </div>

                    {/* Body */}
                    <div className="bg-white px-8 py-6 space-y-5">
                      {/* Brief summary pills */}
                      <div className="flex flex-wrap gap-2">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f5f5f7] text-xs font-medium text-[#1d1d1f]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#0071e3] inline-block" />
                          {selectedVolume.range}
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f5f5f7] text-xs font-medium text-[#1d1d1f]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#0071e3] inline-block" />
                          {selectedTimeline.label} timeline
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f5f5f7] text-xs font-medium text-[#1d1d1f]">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                          ISO9001 Accredited
                        </span>
                      </div>

                      {/* Capabilities */}
                      <div>
                        <p className="text-xs font-medium text-[#86868b] uppercase tracking-widest mb-3">
                          What's included
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {selectedFormat.capabilities.map((c) => (
                            <div key={c} className="flex items-center gap-2 text-sm text-[#1d1d1f]">
                              <svg className="w-4 h-4 text-[#0071e3] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                              {c}
                            </div>
                          ))}
                          <div className="flex items-center gap-2 text-sm text-[#1d1d1f]">
                            <svg className="w-4 h-4 text-[#0071e3] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                            Full batch traceability
                          </div>
                          <div className="flex items-center gap-2 text-sm text-[#1d1d1f]">
                            <svg className="w-4 h-4 text-[#0071e3] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                            Independent QA on every batch
                          </div>
                        </div>
                      </div>

                      {/* Timeline note */}
                      <div className="rounded-xl bg-[#f5f5f7] px-4 py-3 text-xs text-[#86868b] leading-relaxed">
                        <span className="font-medium text-[#1d1d1f]">Timeline note: </span>
                        {selectedTimeline.note}
                      </div>
                    </div>

                    {/* CTA */}
                    <div className="bg-[#f5f5f7] px-8 py-5 flex flex-col sm:flex-row items-center gap-3">
                      <button
                        onClick={saveBriefAndScroll}
                        className="w-full sm:w-auto flex-1 h-11 rounded-xl bg-[#0071e3] text-white text-sm font-medium hover:bg-[#0077ed] transition-colors"
                      >
                        Send this brief to Label Origin →
                      </button>
                      <button
                        onClick={() => { setBrief({ format: "", volume: "", timeline: "" }); setStep(0); }}
                        className="text-xs text-[#86868b] hover:text-[#1d1d1f] transition-colors"
                      >
                        Start over
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="max-w-[400px] mx-auto text-center py-8"
            >
              <div className="w-12 h-12 rounded-full bg-[#0071e3]/10 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-[#0071e3]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-[#1d1d1f] font-semibold text-lg mb-1">Brief saved.</p>
              <p className="text-[#86868b] text-sm">Scrolling to the contact form — your selections have been pre-filled.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
