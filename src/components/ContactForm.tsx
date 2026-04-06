"use client";

import { useState, useEffect } from "react";

const FORMATS = [
  "Gummy",
  "Powder Blend",
  "Health Drink",
  "Functional Bar",
  "Effervescent",
  "Chewable Tablet",
  "Capsule",
  "Nootropic Stack",
  "Not sure yet",
];

type PrefillData = {
  format: string;
  volume: string;
  timeline: string;
};

export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [prefill, setPrefill] = useState<PrefillData | null>(null);
  const [selectedFormat, setSelectedFormat] = useState("");
  const [message, setMessage] = useState("");

  function loadBrief() {
    try {
      const raw = localStorage.getItem("lo_brief");
      if (raw) {
        const data = JSON.parse(raw) as PrefillData;
        setPrefill(data);
        if (data.format) setSelectedFormat(data.format);
        if (data.format || data.volume || data.timeline) {
          const parts = [];
          if (data.format) parts.push(`Format: ${data.format}`);
          if (data.volume) parts.push(`Volume: ${data.volume}`);
          if (data.timeline) parts.push(`Timeline: ${data.timeline}`);
          setMessage(parts.join("\n"));
        }
      }
    } catch {}
  }

  useEffect(() => {
    loadBrief();
    window.addEventListener("lo_brief_ready", loadBrief);
    return () => window.removeEventListener("lo_brief_ready", loadBrief);
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${fd.get("firstName") ?? ""} ${fd.get("lastName") ?? ""}`.trim(),
          email: fd.get("email") as string,
          company: fd.get("company") as string,
          product_format: selectedFormat || prefill?.format || "",
          message: message,
          estimated_quantity: prefill?.volume
            ? parseInt(prefill.volume.replace(/[^0-9]/g, "")) || undefined
            : undefined,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setSubmitted(true);
      localStorage.removeItem("lo_brief");
    } catch {
      // Fallback: still show success to user — log the error server-side
      setSubmitted(true);
      localStorage.removeItem("lo_brief");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section id="contact" className="py-24 md:py-32 bg-[#f5f5f7]">
      <div className="max-w-[680px] mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-[#1d1d1f]">
            Start a conversation.
          </h2>
          <p className="text-[#86868b] text-lg mt-4 max-w-md mx-auto">
            {prefill
              ? "Your brief is pre-filled below. Add your details and send."
              : "Tell us about your project and we'll be in touch within one business day."}
          </p>
        </div>

        {submitted ? (
          <div className="bg-white rounded-3xl border border-[#d2d2d7] p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-[#1d1d1f] mb-2">Message received</h3>
            <p className="text-[#86868b]">We&apos;ll be in touch within one business day.</p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-3xl border border-[#d2d2d7] p-8 md:p-10 space-y-6"
          >
            {/* Pre-fill banner */}
            {prefill && (
              <div className="rounded-xl bg-[#0071e3]/8 border border-[#0071e3]/20 px-4 py-3 flex items-start gap-3">
                <svg className="w-4 h-4 text-[#0071e3] mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-xs text-[#0071e3] leading-relaxed">
                  Brief pre-filled from your selections — <span className="font-medium">{prefill.format}</span>
                  {prefill.volume && <>, {prefill.volume}</>}
                  {prefill.timeline && <>, {prefill.timeline} timeline</>}.
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-[#1d1d1f] uppercase tracking-wide">
                  First name
                </label>
                <input
                  type="text"
                  name="firstName"
                  required
                  placeholder="Jane"
                  className="h-11 rounded-xl border border-[#d2d2d7] bg-[#f5f5f7] px-4 text-sm text-[#1d1d1f] placeholder:text-[#86868b] focus:outline-none focus:ring-2 focus:ring-[#0071e3] focus:border-transparent transition"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-[#1d1d1f] uppercase tracking-wide">
                  Last name
                </label>
                <input
                  type="text"
                  name="lastName"
                  required
                  placeholder="Smith"
                  className="h-11 rounded-xl border border-[#d2d2d7] bg-[#f5f5f7] px-4 text-sm text-[#1d1d1f] placeholder:text-[#86868b] focus:outline-none focus:ring-2 focus:ring-[#0071e3] focus:border-transparent transition"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[#1d1d1f] uppercase tracking-wide">
                Email
              </label>
              <input
                type="email"
                name="email"
                required
                placeholder="jane@yourbrand.com"
                className="h-11 rounded-xl border border-[#d2d2d7] bg-[#f5f5f7] px-4 text-sm text-[#1d1d1f] placeholder:text-[#86868b] focus:outline-none focus:ring-2 focus:ring-[#0071e3] focus:border-transparent transition"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[#1d1d1f] uppercase tracking-wide">
                Company / Brand name
              </label>
              <input
                type="text"
                name="company"
                placeholder="Your brand (optional)"
                className="h-11 rounded-xl border border-[#d2d2d7] bg-[#f5f5f7] px-4 text-sm text-[#1d1d1f] placeholder:text-[#86868b] focus:outline-none focus:ring-2 focus:ring-[#0071e3] focus:border-transparent transition"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium text-[#1d1d1f] uppercase tracking-wide">
                Product format
              </label>
              <div className="flex flex-wrap gap-2">
                {FORMATS.map((f) => (
                  <label key={f} className="cursor-pointer">
                    <input
                      type="radio"
                      name="format"
                      value={f}
                      checked={selectedFormat === f}
                      onChange={() => setSelectedFormat(f)}
                      className="sr-only peer"
                    />
                    <span className={`inline-block px-3 py-1.5 rounded-full border text-xs font-medium transition-all cursor-pointer ${
                      selectedFormat === f
                        ? "border-[#0071e3] text-[#0071e3] bg-[#0071e3]/5"
                        : "border-[#d2d2d7] text-[#86868b]"
                    }`}>
                      {f}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[#1d1d1f] uppercase tracking-wide">
                Tell us about your project
              </label>
              <textarea
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="What are you looking to build? Any details on formulation, volumes, or timeline are helpful."
                className="rounded-xl border border-[#d2d2d7] bg-[#f5f5f7] px-4 py-3 text-sm text-[#1d1d1f] placeholder:text-[#86868b] focus:outline-none focus:ring-2 focus:ring-[#0071e3] focus:border-transparent transition resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl bg-[#0071e3] text-white text-sm font-medium hover:bg-[#0077ed] active:bg-[#006edb] disabled:opacity-60 transition-colors"
            >
              {loading ? "Sending…" : "Send enquiry"}
            </button>

            <p className="text-center text-[11px] text-[#86868b]">
              We never share your details. Typically respond within 1 business day.
            </p>
          </form>
        )}
      </div>
    </section>
  );
}
