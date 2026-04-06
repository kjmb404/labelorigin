"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

// ─── Data ────────────────────────────────────────────────────────────────────

const FORMATS = [
  { id: "Gummy",           label: "Gummy",           apiKey: "Gummies"       },
  { id: "Powder Blend",    label: "Powder Blend",    apiKey: "Powders"       },
  { id: "Health Drink",    label: "Health Drink",    apiKey: "Ready_to_Drink"},
  { id: "Functional Bar",  label: "Functional Bar",  apiKey: "Gummies"       },
  { id: "Effervescent",    label: "Effervescent",    apiKey: "Tablets"       },
  { id: "Chewable Tablet", label: "Chewable Tablet", apiKey: "Tablets"       },
  { id: "Capsule",         label: "Capsule",         apiKey: "Capsules"      },
  { id: "Nootropic Stack", label: "Nootropic Stack", apiKey: "Capsules"      },
] as const;

const VOLUMES = [
  { id: "startup", label: "Startup",      range: "1k – 5k units",  orderQty: 1000  },
  { id: "scale",   label: "Scale",        range: "5k – 25k units", orderQty: 5000  },
  { id: "retail",  label: "Retail Ready", range: "25k+ units",     orderQty: 25000 },
] as const;

const TIMELINES = [
  { id: "asap",    label: "ASAP",      launchDays: 56  },
  { id: "3months", label: "3 months",  launchDays: 90  },
  { id: "6months", label: "6+ months", launchDays: 180 },
] as const;

const TARGET_MARKETS = ["UK", "Europe", "Outside the EU", "All the Above"] as const;

const PRODUCT_STATUS = ["New product", "Existing product"] as const;

const PRODUCT_TYPES = [
  "Nootropics",
  "Gut Health",
  "Core Nutrition",
  "Beauty & Longevity",
  "Active Nutrition",
  "CBD",
  "Other / TBC",
] as const;

type FormatId      = (typeof FORMATS)[number]["id"];
type VolumeId      = (typeof VOLUMES)[number]["id"];
type TimelineId    = (typeof TIMELINES)[number]["id"];
type MarketId      = (typeof TARGET_MARKETS)[number];
type ProductStatus = (typeof PRODUCT_STATUS)[number];
type ProductTypeId = (typeof PRODUCT_TYPES)[number];

interface QuoteResult {
  format: string;
  units_per_product: number;
  order_quantity: number;
  estimated_cost_per_product: number;
  wholesale: { floor: number; recommended: number; ceiling: number };
  suggested_rrp: { low: number; recommended: number; high: number };
  client_margin: string;
  market_position: string;
  market_rrp_range: { budget: string; mid: string; premium: string } | null;
  estimated_order_total: number;
  volume_note: string;
}

// ─── Shared UI tokens ────────────────────────────────────────────────────────

const inputClass =
  "h-11 rounded-xl border border-[#d2d2d7] bg-[#f5f5f7] px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#0071e3] focus:border-transparent transition text-[#1d1d1f] w-full";

const submitBtnClass =
  "w-full h-12 rounded-xl bg-[#0071e3] text-white text-sm font-medium hover:bg-[#0077ed] disabled:opacity-60 transition-colors";

const pillBase =
  "rounded-full border px-4 py-1.5 text-xs font-medium transition-all duration-200 cursor-pointer";

const pillActive   = "border-[#0071e3] bg-[#0071e3] text-white";
const pillInactive = "border-[#d2d2d7] bg-[#f5f5f7] text-[#1d1d1f] hover:border-[#0071e3] hover:bg-[#0071e3]/5";

// ─── Step variants ───────────────────────────────────────────────────────────

const variants = {
  enter:  (dir: number) => ({ x: dir > 0 ?  48 : -48, opacity: 0 }),
  center: ()            => ({ x: 0,                    opacity: 1 }),
  exit:   (dir: number) => ({ x: dir > 0 ? -48 :  48, opacity: 0 }),
};

const transition = { duration: 0.3, ease: [0.32, 0.72, 0, 1] as [number, number, number, number] };

// ─── Component ───────────────────────────────────────────────────────────────

export default function LeadCapture() {
  const [step, setStep]     = useState(0);
  const [direction, setDir] = useState(1);

  // Brief
  const [format,         setFormat]         = useState<FormatId | "">("");
  const [volume,         setVolume]         = useState<VolumeId | "">("");
  const [timeline,       setTimeline]       = useState<TimelineId | "">("");
  const [targetMarket,   setTargetMarket]   = useState<MarketId | "">("");
  const [productStatus,  setProductStatus]  = useState<ProductStatus | "">("");
  const [productType,    setProductType]    = useState<ProductTypeId | "">("");

  // Quote (fetched silently in the background)
  const [quote, setQuote] = useState<QuoteResult | null>(null);

  // Contact
  const [firstName,   setFirstName]   = useState("");
  const [lastName,    setLastName]    = useState("");
  const [email,       setEmail]       = useState("");
  const [company,     setCompany]     = useState("");
  const [phone,       setPhone]       = useState("");
  const [notes,       setNotes]       = useState("");
  const [submitting,  setSubmitting]  = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // ── Navigation ────────────────────────────────────────────────────────────

  function goTo(next: number) {
    setDir(next > step ? 1 : -1);
    setStep(next);
  }

  function reset() {
    setDir(-1);
    setFormat(""); setVolume(""); setTimeline("");
    setTargetMarket(""); setProductStatus(""); setProductType("");
    setQuote(null);
    setFirstName(""); setLastName(""); setEmail("");
    setCompany(""); setPhone(""); setNotes(""); setSubmitError(null);
    setStep(0);
  }

  // ── Step 0 → 1: pick format ───────────────────────────────────────────────

  function pickFormat(id: FormatId) {
    setFormat(id);
    setTimeout(() => goTo(1), 180);
  }

  // ── Step 1 → 2: silently fetch quote, advance to email capture ───────────

  async function advanceToDetails() {
    if (!format || !volume) return;

    const fmt = FORMATS.find((f) => f.id === format)!;
    const vol = VOLUMES.find((v) => v.id === volume)!;

    goTo(2);

    // Fire-and-forget — we store the result for the CRM payload
    fetch("/api/quote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        product_format:    fmt.apiKey,
        units_per_product: 60,
        num_ingredients:   4,
        order_quantity:    vol.orderQty,
      }),
    })
      .then((r) => r.json())
      .then((data) => { if (data.success) setQuote(data.estimate); })
      .catch(() => { /* silently ignore — quote data is supplementary */ });
  }

  // ── Step 2 → 3: submit enquiry ────────────────────────────────────────────

  async function submitEnquiry(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;

    const fmt = FORMATS.find((f) => f.id === format);
    const vol = VOLUMES.find((v) => v.id === volume);
    const tl  = TIMELINES.find((t) => t.id === timeline);

    setSubmitting(true); setSubmitError(null);

    try {
      await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // Contact
          name:    `${firstName} ${lastName}`.trim(),
          email,
          company,
          phone,
          // Product brief
          product_format:     fmt?.apiKey ?? "Gummies",
          product_status:     productStatus   || undefined,
          estimated_quantity: vol?.orderQty ?? 1000,
          target_market:      targetMarket    || undefined,
          product_type:       productType     || undefined,
          timeline:           tl?.label       ?? "",
          launch_days:        tl?.launchDays  ?? 90,
          // Quote snapshot → CRM fields
          suggested_rrp:     quote?.suggested_rrp.recommended   ?? null,
          wholesale_price:   quote?.wholesale.recommended        ?? null,
          market_position:   quote?.market_position              ?? null,
          client_margin_pct: 60,
          quote_total:       quote?.estimated_order_total        ?? null,
          cost_per_unit:     quote?.estimated_cost_per_product   ?? null,
          units_per_product: 60,
          message: notes || undefined,
          // Human-readable brief for CRM description
          product_description: [
            `Format: ${fmt?.label ?? ""}`,
            `Product status: ${productStatus || ""}`,
            `Volume: ${vol?.label ?? ""} (${vol?.orderQty?.toLocaleString()} units)`,
            `Timeline: ${tl?.label ?? ""}`,
            targetMarket  ? `Target Market: ${targetMarket}`         : "",
            productType   ? `Product Category: ${productType}`       : "",
            quote ? `Est. cost/unit: £${quote.estimated_cost_per_product.toFixed(2)}`                        : "",
            quote ? `Wholesale price: £${quote.wholesale.recommended.toFixed(2)}`                            : "",
            quote ? `Suggested RRP: £${quote.suggested_rrp.recommended.toFixed(2)}`                          : "",
            quote ? `Client margin: ${quote.client_margin}`                                                  : "",
            quote ? `Market position: ${quote.market_position}`                                              : "",
            quote ? `Est. order total: £${quote.estimated_order_total.toLocaleString("en-GB", { minimumFractionDigits: 2 })}` : "",
          ].filter(Boolean).join("\n"),
        }),
      });
      goTo(3);
    } catch {
      setSubmitError("Something went wrong — please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  // ── Derived ───────────────────────────────────────────────────────────────

  const selectedFormat   = FORMATS.find((f) => f.id === format);
  const selectedVolume   = VOLUMES.find((v) => v.id === volume);
  const selectedTimeline = TIMELINES.find((t) => t.id === timeline);

  const canAdvanceStep1 = !!volume && !!timeline && !!targetMarket && !!productStatus;

  const STEP_LABELS = ["Format", "Specs", "Your details", "Done"];

  // ─────────────────────────────────────────────────────────────────────────
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
        </div>

        {/* Progress */}
        {step < 4 && (
          <div className="flex items-center justify-center gap-2 mb-10">
            {STEP_LABELS.map((label, i) => (
              <div key={label} className="flex items-center gap-2">
                <div className="flex flex-col items-center gap-1">
                  <div className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    i < step ? "bg-[#0071e3]" : i === step ? "bg-[#1d1d1f] scale-125" : "bg-[#d2d2d7]"
                  }`} />
                  <span className={`text-[10px] font-medium transition-colors ${
                    i === step ? "text-[#1d1d1f]" : "text-[#d2d2d7]"
                  }`}>{label}</span>
                </div>
                {i < STEP_LABELS.length - 1 && (
                  <div className={`w-8 h-px mb-4 transition-colors ${i < step ? "bg-[#0071e3]" : "bg-[#d2d2d7]"}`} />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Steps */}
        <div className="overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={transition}
            >

              {/* ── Step 0: Format ── */}
              {step === 0 && (
                <div>
                  <p className="text-center text-lg font-semibold text-[#1d1d1f] mb-2">What are you making?</p>
                  <p className="text-center text-sm text-[#86868b] mb-8">Select a format to get started.</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {FORMATS.map((f) => (
                      <button
                        key={f.id}
                        onClick={() => pickFormat(f.id as FormatId)}
                        className={`rounded-2xl border px-4 py-5 text-left transition-all duration-200 hover:border-[#0071e3] hover:bg-[#0071e3]/5 group ${
                          format === f.id ? "border-[#0071e3] bg-[#0071e3]/5" : "border-[#d2d2d7] bg-[#f5f5f7]"
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

              {/* ── Step 1: Specs ── */}
              {step === 1 && (
                <div className="max-w-[640px] mx-auto">
                  <p className="text-center text-lg font-semibold text-[#1d1d1f] mb-2">Tell us about your order.</p>
                  <p className="text-center text-sm text-[#86868b] mb-8">Answer a few quick questions to receive your estimate.</p>

                  {/* New / Existing */}
                  <p className="text-xs font-semibold text-[#86868b] uppercase tracking-widest mb-3">Product</p>
                  <div className="grid grid-cols-2 gap-3 mb-7">
                    {PRODUCT_STATUS.map((s) => (
                      <button
                        key={s}
                        onClick={() => setProductStatus(s)}
                        className={`rounded-2xl border p-5 text-left transition-all duration-200 hover:border-[#0071e3] hover:bg-[#0071e3]/5 ${
                          productStatus === s ? "border-[#0071e3] bg-[#0071e3]/5" : "border-[#d2d2d7] bg-[#f5f5f7]"
                        }`}
                      >
                        <span className="block text-sm font-semibold text-[#1d1d1f]">{s}</span>
                        <span className="block text-xs text-[#86868b] mt-0.5">
                          {s === "New product" ? "Starting from scratch" : "Reformulate or repackage"}
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Volume */}
                  <p className="text-xs font-semibold text-[#86868b] uppercase tracking-widest mb-3">Volume</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-7">
                    {VOLUMES.map((v) => (
                      <button
                        key={v.id}
                        onClick={() => setVolume(v.id)}
                        className={`rounded-2xl border p-5 text-left transition-all duration-200 hover:border-[#0071e3] hover:bg-[#0071e3]/5 ${
                          volume === v.id ? "border-[#0071e3] bg-[#0071e3]/5" : "border-[#d2d2d7] bg-[#f5f5f7]"
                        }`}
                      >
                        <span className="block text-sm font-semibold text-[#1d1d1f] mb-0.5">{v.label}</span>
                        <span className="block text-xs text-[#0071e3] font-medium">{v.range}</span>
                      </button>
                    ))}
                  </div>

                  {/* Timeline */}
                  <p className="text-xs font-semibold text-[#86868b] uppercase tracking-widest mb-3">Timeline</p>
                  <div className="flex flex-wrap gap-2 mb-7">
                    {TIMELINES.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setTimeline(t.id)}
                        className={`${pillBase} ${timeline === t.id ? pillActive : pillInactive} px-5 py-2 text-sm`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>

                  {/* Target Market */}
                  <p className="text-xs font-semibold text-[#86868b] uppercase tracking-widest mb-3">Target Market</p>
                  <div className="flex flex-wrap gap-2 mb-8">
                    {TARGET_MARKETS.map((m) => (
                      <button
                        key={m}
                        onClick={() => setTargetMarket(m)}
                        className={`${pillBase} ${targetMarket === m ? pillActive : pillInactive} px-5 py-2 text-sm`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>

                  {/* CTA */}
                  <div className="flex flex-col items-center gap-3">
                    <AnimatePresence>
                      {canAdvanceStep1 && (
                        <motion.button
                          key="cta"
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 8 }}
                          transition={{ duration: 0.2 }}
                          onClick={advanceToDetails}
                          className="h-12 rounded-xl bg-[#0071e3] text-white text-sm font-medium px-10 hover:bg-[#0077ed] transition-colors"
                        >
                          Request a call →
                        </motion.button>
                      )}
                    </AnimatePresence>
                    <button onClick={() => goTo(0)} className="text-xs text-[#86868b] hover:text-[#1d1d1f] transition-colors">
                      ← Back
                    </button>
                  </div>
                </div>
              )}

              {/* ── Step 2: Your details (email capture) ── */}
              {step === 2 && (
                <div className="max-w-[640px] mx-auto">
                  <div className="rounded-3xl border border-[#d2d2d7] bg-white overflow-hidden">
                    <div className="px-8 pt-8 pb-6">
                      <p className="text-xs font-medium text-[#86868b] uppercase tracking-[0.3em] mb-2">Almost there</p>
                      <h3 className="text-2xl font-semibold text-[#1d1d1f] mb-1">Where should we reach you?</h3>
                      <p className="text-sm text-[#86868b]">We'll review your brief and be in touch to arrange a quick call.</p>
                    </div>

                    <form onSubmit={submitEnquiry} className="px-8 pb-8 space-y-4">

                      {/* Name */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-[#1d1d1f] mb-1.5">
                            First name <span className="text-[#0071e3]">*</span>
                          </label>
                          <input
                            required
                            type="text"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            placeholder="Alex"
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-[#1d1d1f] mb-1.5">
                            Last name <span className="text-[#0071e3]">*</span>
                          </label>
                          <input
                            required
                            type="text"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            placeholder="Johnson"
                            className={inputClass}
                          />
                        </div>
                      </div>

                      {/* Email */}
                      <div>
                        <label className="block text-xs font-medium text-[#1d1d1f] mb-1.5">
                          Email <span className="text-[#0071e3]">*</span>
                        </label>
                        <input
                          required
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="alex@yourbrand.com"
                          className={inputClass}
                        />
                      </div>

                      {/* Company */}
                      <div>
                        <label className="block text-xs font-medium text-[#1d1d1f] mb-1.5">
                          Company / Brand <span className="text-[#86868b] font-normal">(optional)</span>
                        </label>
                        <input
                          type="text"
                          value={company}
                          onChange={(e) => setCompany(e.target.value)}
                          placeholder="Your Brand Ltd"
                          className={inputClass}
                        />
                      </div>

                      {/* Phone */}
                      <div>
                        <label className="block text-xs font-medium text-[#1d1d1f] mb-1.5">
                          Phone <span className="text-[#86868b] font-normal">(optional)</span>
                        </label>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+44 7700 900000"
                          className={inputClass}
                        />
                      </div>

                      {/* Product Category */}
                      <div>
                        <label className="block text-xs font-medium text-[#1d1d1f] mb-2">
                          Product category <span className="text-[#86868b] font-normal">(optional)</span>
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {PRODUCT_TYPES.map((pt) => (
                            <button
                              key={pt}
                              type="button"
                              onClick={() => setProductType(productType === pt ? "" : pt)}
                              className={`${pillBase} ${productType === pt ? pillActive : pillInactive}`}
                            >
                              {pt}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Notes */}
                      <div>
                        <label className="block text-xs font-medium text-[#1d1d1f] mb-1.5">
                          Anything else to add? <span className="text-[#86868b] font-normal">(optional)</span>
                        </label>
                        <textarea
                          rows={3}
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="Formulation ideas, existing brand, specific ingredients, certifications needed…"
                          className="rounded-xl border border-[#d2d2d7] bg-[#f5f5f7] px-4 py-3 text-sm text-[#1d1d1f] placeholder:text-[#86868b] focus:outline-none focus:ring-2 focus:ring-[#0071e3] focus:border-transparent transition resize-none w-full"
                        />
                      </div>

                      {submitError && <p className="text-sm text-red-600">{submitError}</p>}

                      <button type="submit" disabled={submitting} className={submitBtnClass}>
                        {submitting ? "Sending…" : "Request a call"}
                      </button>

                      <p className="text-center text-[11px] text-[#86868b]">
                        No spam. We'll only use your details to follow up on your brief.
                      </p>
                    </form>
                  </div>

                  <div className="flex items-center justify-between mt-4 px-1">
                    <button onClick={() => goTo(1)} className="text-xs text-[#86868b] hover:text-[#1d1d1f] transition-colors">← Back</button>
                    <button onClick={reset}         className="text-xs text-[#86868b] hover:text-[#1d1d1f] transition-colors">Start over</button>
                  </div>
                </div>
              )}

              {/* ── Step 3: Success ── */}
              {step === 3 && (
                <div className="max-w-[640px] mx-auto text-center py-4">
                  <div className="rounded-3xl border border-[#d2d2d7] bg-white px-8 py-12">
                    <div className="w-16 h-16 rounded-full bg-[#0071e3]/10 flex items-center justify-center mx-auto mb-6">
                      <svg className="w-8 h-8 text-[#0071e3]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-semibold text-[#1d1d1f] mb-2">Brief received.</h3>
                    <p className="text-[#86868b] text-sm mb-8 max-w-sm mx-auto">
                      We'll review your brief and reach out to <strong className="text-[#1d1d1f]">{email}</strong> to arrange a quick call.
                    </p>

                    <div className="rounded-2xl bg-[#f5f5f7] px-6 py-5 text-left space-y-2.5 mb-8">
                      <p className="text-xs font-semibold text-[#86868b] uppercase tracking-widest mb-1">Your brief</p>
                      {(([
                        { label: "Format",         value: selectedFormat?.label },
                        { label: "Product",        value: productStatus  || undefined },
                        { label: "Volume",         value: selectedVolume?.range },
                        { label: "Timeline",       value: selectedTimeline?.label },
                        { label: "Target market",  value: targetMarket   || undefined },
                        { label: "Category",       value: productType    || undefined },
                      ] as { label: string; value: string | undefined }[])
                        .filter((r): r is { label: string; value: string } => typeof r.value === "string"))
                        .map((row) => (
                          <div key={row.label} className="flex items-center justify-between">
                            <span className="text-xs text-[#86868b]">{row.label}</span>
                            <span className="text-sm font-medium text-[#1d1d1f]">{row.value}</span>
                          </div>
                        ))}
                    </div>

                    <button onClick={reset} className="text-sm text-[#0071e3] hover:underline">
                      Build another brief
                    </button>
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
