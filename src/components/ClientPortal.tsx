/**
 * Client Portal — Label Origin
 * Tabs: Overview · My Orders · Catalogue · Documents · Invoices
 */

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Deal {
  id: string;
  name: string;
  stage: string;
  stage_percent: number;
  stage_index: number;
  product_format: string;
  quote_total: number | null;
  wholesale_price: number | null;
  suggested_rrp: number | null;
  market_position: string | null;
  moq: number | null;
  cost_per_unit: number | null;
  client_margin: number | null;
  created: string;
  modified: string;
  closing_date: string;
  completed_stages: string[];
  current_stage: string;
  upcoming_stages: string[];
  brief_submitted: boolean;
}

interface Invoice {
  id: string;
  number: string;
  date: string;
  due_date: string;
  status: string;
  total: number;
  balance: number;
  currency: string;
  reference: string;
}

// ─── Catalogue data ────────────────────────────────────────────────────────────

const FORMATS = [
  {
    id: "gummies",
    format: "Gummies",
    tagline: "Wellness that works, wrapped in a format people love",
    description:
      "The gummy format didn't just grow — it disrupted an entire industry, turning a daily obligation into a genuine consumer moment. Taste, texture, format, fun — gummies cracked the code that traditional pills never could. Pectin-based (vegan) or gelatine, in single-layer, dual-layer, and filled formats. Flexible order quantities; private label and fully bespoke options available.",
    moq: "10,000 units",
    leadTime: "14–18 weeks",
    activeLoad: "Up to 500mg per gummy",
    servingSize: "1–4 gummies",
    highlights: ["Pectin (vegan) or gelatine", "Custom shapes & flavours", "Private label & bespoke", "Sugar-free options"],
  },
  {
    id: "softgels",
    format: "Soft Gels",
    tagline: "Precision, performance, perfection",
    description:
      "Elegant, precise, and built for bioavailability. The softgel is the delivery system of choice for nutrients that demand more than a standard capsule can offer — oils, lipid-soluble actives, and sensitive botanicals. From outer shell construction to active ingredient selection, every decision is made with absorption, stability, and efficacy in mind.",
    moq: "50,000 units",
    leadTime: "10–14 weeks",
    activeLoad: "Up to 1,200mg",
    servingSize: "1–2 softgels",
    highlights: ["Oil-soluble actives", "Enhanced bioavailability", "Gelatine or vegan shell", "Liquid-filled"],
  },
  {
    id: "liquids",
    format: "Liquids & Topicals",
    tagline: "The future is fluid",
    description:
      "Liquid supplements offer rapid absorption and superior bioavailability, ideal for consumers who prefer fast-acting solutions or struggle with pills. Our advanced liposomal technology uses phospholipids to enhance nutrient delivery, protect against degradation, and improve overall absorption. Low MOQ from 500 bottles.",
    moq: "500 bottles",
    leadTime: "12–16 weeks",
    activeLoad: "Formulation-dependent",
    servingSize: "10ml–30ml",
    highlights: ["Liposomal technology", "Rapid absorption", "Glass & PET formats", "Custom flavouring"],
  },
  {
    id: "powders",
    format: "Powders",
    tagline: "Flexible. Effective. On-trend.",
    description:
      "Powdered supplements continue to gain momentum as a preferred format for today's health-conscious consumers. Whether stirred into water, blended into smoothies, or added to everyday recipes, powders offer unmatched versatility. Minimum batch sizes from 150kg. All formulas developed to GMP standard and supplied with a Certificate of Analysis.",
    moq: "150kg",
    leadTime: "6–10 weeks",
    activeLoad: "Unlimited",
    servingSize: "5–30g per serving",
    highlights: ["GMP standard", "COA supplied", "Instant-mix options", "Sachet & tub fill"],
  },
  {
    id: "capsules",
    format: "Capsules",
    tagline: "Reliable. Adaptable. Evolving.",
    description:
      "Capsules are one of the most trusted and widely used supplement formats, valued for their familiarity and ease of use. Their versatility makes them ideal for delivering complex blends, targeted nutrition, or time-release formulations — especially when other formats may fall short. Available in a variety of sizes and capsule types to meet the needs of today's evolving health and wellness market.",
    moq: "50,000 units",
    leadTime: "8–12 weeks",
    activeLoad: "Up to 800mg fill weight",
    servingSize: "1–3 capsules",
    highlights: ["HPMC (vegan) or gelatine", "Size 0 to 4", "Enteric coating available", "Complex stacks"],
  },
  {
    id: "empty-caps",
    format: "Empty Capsules",
    tagline: "Fill your own formulation",
    description:
      "HPMC (vegan) and gelatine empty hard-shell capsules for brands who manage their own filling operations or require bulk capsule supply. Available in a full range of sizes and colours, with transparent supply chain documentation and fast lead times.",
    moq: "10,000 units",
    leadTime: "2–4 weeks",
    activeLoad: "N/A",
    servingSize: "N/A",
    highlights: ["HPMC (vegan) or gelatine", "Multiple sizes", "Custom colours", "Fast lead time"],
  },
];

const I = (name: string) => `/ingredients/${name}.jpg`;

const INGREDIENT_CATEGORIES = [
  {
    id: "nootropics",
    label: "Nootropics",
    tagline: "Making the brain work better",
    restricted: false,
    ingredients: [
      { name: "Lion's Mane",        img: I("lions-mane"),          benefit: "Supports brain health, focus and mental clarity." },
      { name: "Cordyceps",          img: I("cordyceps"),           benefit: "Supports energy, stamina and endurance." },
      { name: "Ashwagandha",        img: I("ashwagandha"),         benefit: "Helps the body manage stress and supports calm, balanced energy." },
      { name: "Rhodiola",           img: I("rhodiola"),            benefit: "Helps the body adapt to stress and supports mental stamina." },
      { name: "Reishi",             img: I("reishi"),              benefit: "Traditionally used to support relaxation and immune health." },
      { name: "Ginkgo Biloba",      img: I("ginkgo-biloba"),       benefit: "Supports energy, focus and overall vitality." },
      { name: "Bacopa Monnieri",    img: I("bacopa-monnieri"),     benefit: "Traditionally used to support memory, concentration and mental clarity." },
      { name: "L-Theanine",         img: I("l-theanine"),          benefit: "Promotes calm focus and relaxation without causing drowsiness." },
      { name: "Phosphatidylserine", img: I("phosphatidylserine"),  benefit: "Supports memory, concentration and healthy brain function." },
      { name: "Panax Ginseng",      img: I("panax-ginseng"),       benefit: "Supports energy, focus and physical endurance." },
      { name: "Tremella",           img: I("tremella"),            benefit: "Supports skin hydration and beauty-from-within formulations." },
      { name: "L-Tyrosine",         img: I("l-tyrosine"),          benefit: "Supports mental focus, alertness and performance under stress." },
    ],
  },
  {
    id: "gut-health",
    label: "Gut Health",
    tagline: "Support from the inside out",
    restricted: false,
    ingredients: [
      { name: "Probiotics",               img: I("probiotics"),               benefit: "Support digestive health and a balanced gut microbiome." },
      { name: "Prebiotics",               img: I("prebiotics"),               benefit: "Feed beneficial gut bacteria to support digestion." },
      { name: "Postbiotics",              img: I("postbiotics"),              benefit: "Metabolic byproducts that support gut health and immune function." },
      { name: "Inulin",                   img: I("inulin"),                   benefit: "A natural fibre that supports digestion and gut health." },
      { name: "Psyllium Husk",            img: I("psyllium-husk"),            benefit: "A natural fibre that supports digestion and regularity." },
      { name: "Beta-Glucans",             img: I("beta-glucans"),             benefit: "Support immune function and overall wellness." },
      { name: "Elderberry Extract",       img: I("elderberry-extract"),       benefit: "Traditionally used to support immune health." },
      { name: "Saccharomyces Cerevisiae", img: I("saccharomyces-cerevisiae"), benefit: "A beneficial yeast used to support digestive and immune health." },
      { name: "Bacillus Coagulans",       img: I("bacillus-coagulans"),       benefit: "A probiotic that supports digestive balance and gut comfort." },
      { name: "Manuka Honey",             img: I("manuka-honey"),             benefit: "Supports immune health and natural soothing properties." },
      { name: "Colostrum",                img: I("colostrum"),                benefit: "Supports immune health and gut barrier function." },
      { name: "Chaga",                    img: I("chaga"),                    benefit: "Supports immune health, antioxidant protection and overall wellbeing." },
    ],
  },
  {
    id: "core-nutrition",
    label: "Core Nutrition",
    tagline: "The essentials, done right",
    restricted: false,
    ingredients: [
      { name: "Magnesium",         img: I("magnesium"),    benefit: "Supports relaxation, muscle function, recovery and better sleep quality." },
      { name: "Vitamin D3",        img: I("vitamin-d3"),   benefit: "Supports immune function, bone health and calcium absorption." },
      { name: "Vitamin B12",       img: I("vitamin-b12"),  benefit: "Supports energy metabolism, cognitive function and reduced tiredness." },
      { name: "Vitamin C",         img: I("vitamin-c"),    benefit: "Supports immune health, antioxidant defence and collagen formation." },
      { name: "Zinc Citrate",      img: I("zinc-citrate"), benefit: "Supports immune function, skin health, hormonal balance and recovery." },
      { name: "Omega 3 (EPA/DHA)", img: I("omega-3"),      benefit: "Supports heart health, brain function and healthy inflammation balance." },
      { name: "Protein",           img: I("protein"),      benefit: "Supports muscle maintenance, recovery, satiety and everyday strength." },
      { name: "Collagen",          img: I("collagen"),     benefit: "Supports skin elasticity, joint comfort and connective tissue health." },
      { name: "Calcium",           img: I("calcium"),      benefit: "Supports strong bones, teeth, muscle contraction and structural health." },
      { name: "Iron",              img: I("iron"),         benefit: "Supports oxygen transport, healthy energy levels and reduced fatigue." },
      { name: "Biotin",            img: I("biotin"),       benefit: "Supports healthy hair, skin, nails and normal energy metabolism." },
      { name: "Selenium",          img: I("selenium"),     benefit: "Supports antioxidant defence, thyroid function and immune health." },
    ],
  },
  {
    id: "beauty-longevity",
    label: "Beauty & Longevity",
    tagline: "Serving you face",
    restricted: false,
    ingredients: [
      { name: "Marine Collagen",       img: I("marine-collagen"),       benefit: "Supports skin elasticity, joint health and connective tissue strength." },
      { name: "Hyaluronic Acid",       img: I("hyaluronic-acid"),       benefit: "Helps maintain skin hydration and supports joint comfort." },
      { name: "Astaxanthin",           img: I("astaxanthin"),           benefit: "A powerful antioxidant that supports skin and overall cellular health." },
      { name: "Coenzyme Q10",          img: I("coenzyme-q10"),          benefit: "Supports energy production in cells and heart health." },
      { name: "Resveratrol",           img: I("resveratrol"),           benefit: "Provides antioxidant support and promotes healthy ageing." },
      { name: "Nicotinamide Riboside", img: I("nicotinamide-riboside"), benefit: "Supports cellular energy production and healthy ageing." },
      { name: "Spermidine",            img: I("spermidine"),            benefit: "Supports natural cell renewal and healthy ageing." },
      { name: "Shilajit",              img: I("shilajit"),              benefit: "Supports energy, vitality and mineral replenishment." },
      { name: "Lycopene",              img: I("lycopene"),              benefit: "Provides antioxidant support for skin and overall health." },
      { name: "Sea Buckthorn",         img: I("sea-buckthorn"),         benefit: "Supports skin health and natural hydration." },
      { name: "Sea Moss",              img: I("sea-moss"),              benefit: "Provides minerals that support overall wellness." },
      { name: "Selenium",              img: I("selenium-bl"),           benefit: "Supports antioxidant defence, thyroid function and immune health." },
    ],
  },
  {
    id: "active-nutrition",
    label: "Active Nutrition",
    tagline: "Built for performance",
    restricted: false,
    ingredients: [
      { name: "Creatine",         img: I("creatine"),        benefit: "Supports muscle strength, power and physical performance." },
      { name: "Electrolytes",     img: I("electrolytes"),    benefit: "Help maintain hydration, nerve function and muscle performance." },
      { name: "Beetroot Extract", img: I("beetroot-extract"), benefit: "Supports blood flow and exercise endurance." },
      { name: "Citrulline",       img: I("citrulline"),      benefit: "Supports circulation and exercise performance." },
      { name: "Taurine",          img: I("taurine"),         benefit: "Supports energy production, hydration and exercise recovery." },
      { name: "Protein",          img: I("protein-an"),      benefit: "Supports muscle maintenance, recovery, satiety and everyday strength." },
      { name: "Beta-Alanine",     img: I("beta-alanine"),    benefit: "Supports muscular endurance during intense exercise." },
      { name: "L-Carnitine",      img: I("l-carnitine"),     benefit: "Helps convert fat into energy and supports exercise performance." },
      { name: "Tyrosine",         img: I("tyrosine"),        benefit: "Supports mental focus, alertness and performance under stress." },
      { name: "BCAAs",            img: I("bcaas"),           benefit: "Support muscle recovery and muscle protein synthesis." },
      { name: "Magnesium",        img: I("magnesium-an"),    benefit: "Supports relaxation, muscle function, recovery and electrolyte balance." },
      { name: "Cordyceps",        img: I("cordyceps-an"),    benefit: "Supports energy, stamina and endurance." },
    ],
  },
  {
    id: "cbd",
    label: "CBD",
    tagline: "Authorisation required",
    restricted: true,
    ingredients: [
      { name: "Cold Pressed CBD Oil", img: I("cold-pressed-cbd-oil"), benefit: "Commonly used in wellness products to support relaxation and calm." },
      { name: "CBD Isolate",          img: I("cbd-isolate"),          benefit: "Used in products designed to promote relaxation and balance." },
      { name: "Broad Spectrum",       img: I("broad-spectrum"),       benefit: "Used in hemp wellness products aimed at calm and balance." },
      { name: "Full Spectrum",        img: I("full-spectrum"),        benefit: "Used in hemp products designed to support overall wellbeing." },
      { name: "CBG",                  img: I("cbg"),                  benefit: "A hemp compound being explored for focus and concentration." },
      { name: "CBN",                  img: I("cbn"),                  benefit: "Often used in products designed to support relaxation and sleep." },
      { name: "CBC",                  img: I("cbc"),                  benefit: "Supports relaxation and complementary wellness applications." },
    ],
  },
];

const BLENDS = [
  { id: "energy",        goal: "Energy",        format: "Gummies", ingredients: [{ name: "Cordyceps Strands 20:1", dose: "150mg" }, { name: "Beetroot Extract 20:1", dose: "100mg" }, { name: "Vitamin B12", dose: "2.5μg" }] },
  { id: "cognition",     goal: "Cognition",     format: "Gummies", ingredients: [{ name: "Lion's Mane 20:1", dose: "50mg" }, { name: "Zinc Citrate", dose: "10mg" }] },
  { id: "immunity",      goal: "Immunity",      format: "Gummies", ingredients: [{ name: "Chaga 20:1", dose: "150mg" }, { name: "Vitamin C", dose: "80mg" }] },
  { id: "calming",       goal: "Calming",       format: "Gummies", ingredients: [{ name: "Ashwagandha Extract 20:1", dose: "300mg" }, { name: "L-Tyrosine", dose: "200mg" }, { name: "Lemon Balm", dose: "50mg" }] },
  { id: "inflammation",  goal: "Inflammation",  format: "Gummies", ingredients: [{ name: "Turmeric Extract 50:1", dose: "100mg" }, { name: "Black Pepper Extract 20:1", dose: "20mg" }, { name: "Ginger Extract 20:1", dose: "50mg" }] },
  { id: "weight-loss",   goal: "Weight Loss",   format: "Gummies", ingredients: [{ name: "Apple Cider Vinegar", dose: "250mg" }, { name: "Chromium Picolinate", dose: "40μg" }] },
  { id: "testosterone",  goal: "Testosterone",  format: "Gummies", ingredients: [{ name: "Maca Root 20:1", dose: "75mg" }, { name: "Fenugreek", dose: "15mg" }, { name: "Tribulus Terrestris", dose: "100mg" }, { name: "Zinc Citrate", dose: "10mg" }] },
  { id: "beauty",        goal: "Beauty",        format: "Gummies", ingredients: [{ name: "Tremella 20:1", dose: "100mg" }, { name: "Hyaluronic Acid", dose: "100mg" }, { name: "Biotin", dose: "30μg" }, { name: "Vitamin C", dose: "80mg" }] },
  { id: "aging",         goal: "Aging",         format: "Gummies", ingredients: [{ name: "NAD+", dose: "300mg" }, { name: "Resveratrol", dose: "100mg" }] },
  { id: "sleep",         goal: "Sleep",         format: "Gummies", ingredients: [{ name: "Montmorency Cherry 50:1", dose: "75mg" }, { name: "L-Glycine", dose: "100mg" }, { name: "Vegan Vitamin D3", dose: "25μg" }] },
  { id: "female-health", goal: "Female Health", format: "Gummies", ingredients: [{ name: "Cranberry Extract 50:1", dose: "100mg" }, { name: "Pineapple Extract 20:1", dose: "100mg" }, { name: "Vitamin C", dose: "80mg" }] },
  { id: "pre-workout",   goal: "Pre Workout",   format: "Gummies", ingredients: [{ name: "Natural Caffeine", dose: "100mg" }, { name: "Beta-Alanine", dose: "500mg" }] },
  { id: "sex-health",    goal: "Sex Health",    format: "Gummies", ingredients: [{ name: "Damiana Extract 20:1", dose: "25mg" }, { name: "Fenugreek 20:1", dose: "25mg" }, { name: "Zinc", dose: "10mg" }] },
  { id: "hangover",      goal: "Hangover",      format: "Gummies", ingredients: [{ name: "Prickly Pear 20:1", dose: "150mg" }, { name: "NAC", dose: "100mg" }, { name: "Vitamin B3 (Niacin)", dose: "10mg" }] },
  { id: "gut-brain",     goal: "Gut Brain",     format: "Gummies", ingredients: [{ name: "Zinc", dose: "30mg" }, { name: "Bacillus Coagulans", dose: "100mg" }] },
  { id: "mind-state",    goal: "Mind State",    format: "Gummies", ingredients: [{ name: "CBD Isolate", dose: "10mg" }, { name: "Lion's Mane 20:1", dose: "150mg" }, { name: "Zinc", dose: "10mg" }] },
  { id: "eye-health",    goal: "Eye Health",    format: "Gummies", ingredients: [{ name: "Lutein", dose: "100mg" }, { name: "Vitamin A (Retinol)", dose: "0.8mg" }] },
  { id: "gaming",        goal: "Gaming",        format: "Gummies", ingredients: [{ name: "Lion's Mane 20:1", dose: "100mg" }, { name: "Aronia Berry 20:1", dose: "25mg" }, { name: "Ginseng 20:1", dose: "50mg" }, { name: "Zinc Citrate", dose: "10mg" }] },
];

// ─── Pipeline stages ──────────────────────────────────────────────────────────

const STAGE_ORDER = [
  "New Enquiry",
  "Discovery Call Booked",
  "Initial Brief",
  "Proposal Sent",
  "Proposal Accepted",
  "Sample Development",
  "Sample Approved",
  "Deposit Invoiced",
  "In Production",
  "Final Balance Invoiced",
  "Shipped / Delivery",
  "Closed / Completed",
];

// ─── Shared UI ────────────────────────────────────────────────────────────────

const TABS = [
  { id: "overview",   label: "Overview"   },
  { id: "orders",     label: "My Orders"  },
  { id: "catalogue",  label: "Catalogue"  },
  { id: "documents",  label: "Documents"  },
  { id: "invoices",   label: "Invoices"   },
] as const;

type TabId = (typeof TABS)[number]["id"];

function fmt(n: number | null | undefined, decimals = 2) {
  if (n == null) return "—";
  return `£${n.toLocaleString("en-GB", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    paid:            "bg-green-100 text-green-700",
    sent:            "bg-[#0071e3]/10 text-[#0071e3]",
    overdue:         "bg-red-100 text-red-700",
    draft:           "bg-[#f5f5f7] text-[#86868b]",
    partially_paid:  "bg-amber-100 text-amber-700",
    void:            "bg-[#f5f5f7] text-[#86868b]",
  };
  return (
    <span className={`text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full ${map[status] ?? "bg-[#f5f5f7] text-[#86868b]"}`}>
      {status.replace(/_/g, " ")}
    </span>
  );
}

// ─── Login screen ─────────────────────────────────────────────────────────────

function LoginScreen({
  onSendLink, isLoading, error,
}: {
  onSendLink: (email: string) => Promise<any>;
  isLoading: boolean;
  error: string | null;
}) {
  const [email,   setEmail]   = useState("");
  const [sent,    setSent]    = useState(false);
  const [devLink, setDevLink] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await onSendLink(email);
    if (result?.success) {
      setSent(true);
      if (result.dev_link) setDevLink(result.dev_link);
    }
  };

  if (sent) {
    return (
      <div className="max-w-md mx-auto text-center py-20">
        <div className="w-16 h-16 bg-[#0071e3]/10 rounded-full flex items-center justify-center mx-auto mb-5">
          <svg className="w-8 h-8 text-[#0071e3]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 className="text-2xl font-semibold text-[#1d1d1f] mb-2">Check your inbox</h2>
        <p className="text-[#86868b] mb-6">
          We've sent a secure login link to <strong className="text-[#1d1d1f]">{email}</strong>.
        </p>

        {/* Fallback link — shown when email delivery isn't available */}
        {devLink && (
          <div className="mb-6 rounded-2xl bg-[#f5f5f7] border border-[#d2d2d7] px-5 py-4 text-left">
            <p className="text-xs font-medium text-[#86868b] uppercase tracking-widest mb-2">
              Or click below to sign in directly
            </p>
            <a
              href={devLink}
              className="inline-block h-9 px-5 rounded-xl bg-[#0071e3] text-white text-sm font-medium hover:bg-[#0077ed] transition-colors leading-9"
            >
              Access portal →
            </a>
          </div>
        )}

        <button onClick={() => { setSent(false); setDevLink(null); }} className="text-sm text-[#0071e3] hover:underline">
          Use a different email
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto py-20">
      <p className="text-xs font-medium text-[#86868b] uppercase tracking-[0.3em] mb-3">(Client Portal)</p>
      <h2 className="text-3xl font-semibold text-[#1d1d1f] mb-2">Welcome back.</h2>
      <p className="text-[#86868b] mb-8">Enter your email to receive a secure, one-click login link.</p>
      <form onSubmit={handleSubmit} className="space-y-3">
        {error && <p className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-xl">{error}</p>}
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@yourbrand.com"
          className="h-11 w-full rounded-xl border border-[#d2d2d7] bg-[#f5f5f7] px-4 text-sm text-[#1d1d1f] focus:outline-none focus:ring-2 focus:ring-[#0071e3] transition"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="h-11 w-full rounded-xl bg-[#0071e3] text-white text-sm font-medium hover:bg-[#0077ed] disabled:opacity-60 transition-colors"
        >
          {isLoading ? "Sending…" : "Send Login Link"}
        </button>
      </form>
    </div>
  );
}

// ─── Cal.com booking button ───────────────────────────────────────────────────

declare global { interface Window { Cal?: any } }

function CalBookingButton() {
  const openCal = useCallback(() => {
    window.open("https://cal.eu/labelorigin/discovery-call", "_blank", "noopener,noreferrer");
  }, []);

  return (
    <button
      onClick={openCal}
      className="w-full text-left rounded-2xl bg-[#1d1d1f] px-6 py-5 hover:bg-[#2d2d2f] transition-colors group"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-white/50 uppercase tracking-widest mb-1">Talk to the team</p>
          <p className="text-base font-semibold text-white">Book a call →</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0 group-hover:bg-white/20 transition-colors">
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
          </svg>
        </div>
      </div>
    </button>
  );
}

// ─── Overview tab ─────────────────────────────────────────────────────────────

// ─── Skip call banner ─────────────────────────────────────────────────────────

function SkipCallBanner({ dealId, authHeaders, onRefresh }: { dealId: string; authHeaders: any; onRefresh: () => void }) {
  const [loading, setLoading] = useState(false);
  const [done, setDone]       = useState(false);

  const handleSkip = async () => {
    if (!confirm("Skip the discovery call and go straight to Initial Brief? Our team will be in touch shortly.")) return;
    setLoading(true);
    try {
      const res = await fetch("/api/portal/skip-call", {
        method: "POST",
        headers: { ...(authHeaders as Record<string, string>), "Content-Type": "application/json" },
        body: JSON.stringify({ dealId }),
      });
      const data = await res.json();
      if (data.success) { setDone(true); onRefresh(); }
    } finally {
      setLoading(false);
    }
  };

  if (done) return null;

  return (
    <div className="rounded-2xl border border-[#d2d2d7] bg-white px-6 py-5">
      <p className="text-xs font-medium text-[#86868b] uppercase tracking-widest mb-1">Discovery call</p>
      <p className="text-sm font-semibold text-[#1d1d1f] mb-1">Already know what you want?</p>
      <p className="text-sm text-[#86868b] mb-4">If you've done this before or have a clear brief, you can skip straight to the feasibility review.</p>
      <div className="flex items-center gap-3 flex-wrap">
        <CalBookingButton />
        <button
          onClick={handleSkip}
          disabled={loading}
          className="text-sm text-[#86868b] hover:text-[#1d1d1f] underline underline-offset-2 transition-colors disabled:opacity-50"
        >
          {loading ? "Updating…" : "Skip the call →"}
        </button>
      </div>
    </div>
  );
}

// ─── Pre-call checklist banner ────────────────────────────────────────────────

const CHECKLIST_STEPS = [
  { id: "product",    label: "Your product"         },
  { id: "formula",    label: "Formulation"          },
  { id: "market",     label: "Market & channels"    },
  { id: "references", label: "References & notes"   },
];

function PreCallChecklistBanner({ dealId, authHeaders, onRefresh }: { dealId: string; authHeaders: any; onRefresh: () => void }) {
  const [open,    setOpen]    = useState(false);
  const [step,    setStep]    = useState(0);
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);

  const [answers, setAnswers] = useState({
    product_name:       "",
    health_benefit:     "",
    target_consumer:    "",
    existing_formula:   "",
    ingredients_wanted: "",
    ingredients_avoid:  "",
    certifications:     [] as string[],
    flavour:            "",
    sales_channel:      "",
    label_compliance:   "",
    references:         "",
    additional_notes:   "",
  });

  const set = (key: keyof typeof answers, val: string | string[]) =>
    setAnswers((prev) => ({ ...prev, [key]: val }));

  const toggleCert = (cert: string) => {
    const current = answers.certifications;
    set("certifications", current.includes(cert) ? current.filter((c) => c !== cert) : [...current, cert]);
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await fetch("/api/portal/checklist", {
        method: "POST",
        headers: { ...(authHeaders as Record<string, string>), "Content-Type": "application/json" },
        body: JSON.stringify({ dealId, answers }),
      });
      setSaved(true);
      onRefresh();
    } finally {
      setSaving(false);
    }
  };

  if (saved) {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 px-6 py-5 flex items-center gap-4">
        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0">
          <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-green-800">Brief received — we'll come prepared.</p>
          <p className="text-xs text-green-700 mt-0.5">Your team will review this before the call.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[#0071e3]/30 bg-[#0071e3]/[0.03] overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-[#0071e3] uppercase tracking-widest mb-1">Before your call</p>
          <p className="text-base font-semibold text-[#1d1d1f]">Complete your pre-call brief</p>
          <p className="text-sm text-[#86868b] mt-0.5">~3 minutes · helps us come prepared</p>
        </div>
        <button
          onClick={() => setOpen((o) => !o)}
          className="shrink-0 h-9 px-4 rounded-xl bg-[#0071e3] text-white text-sm font-medium hover:bg-[#0077ed] transition-colors"
        >
          {open ? "Collapse" : "Start brief →"}
        </button>
      </div>

      {/* Step progress */}
      {open && (
        <div className="px-6 pb-6">
          {/* Progress bar */}
          <div className="flex gap-1.5 mb-6">
            {CHECKLIST_STEPS.map((s, i) => (
              <div
                key={s.id}
                className={`h-1 flex-1 rounded-full transition-colors ${i <= step ? "bg-[#0071e3]" : "bg-[#d2d2d7]"}`}
              />
            ))}
          </div>

          <p className="text-xs font-semibold text-[#86868b] uppercase tracking-widest mb-4">
            {step + 1} of {CHECKLIST_STEPS.length} — {CHECKLIST_STEPS[step].label}
          </p>

          {/* Step 1: Product */}
          {step === 0 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#1d1d1f] mb-1.5">Product name <span className="text-[#86868b] font-normal">(if you have one)</span></label>
                <input
                  value={answers.product_name}
                  onChange={(e) => set("product_name", e.target.value)}
                  placeholder="e.g. Clarity Co. Focus Gummies"
                  className="w-full h-10 px-3 rounded-xl border border-[#d2d2d7] text-sm text-[#1d1d1f] placeholder:text-[#d2d2d7] focus:outline-none focus:border-[#0071e3] transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1d1d1f] mb-1.5">Primary health benefit or claim</label>
                <input
                  value={answers.health_benefit}
                  onChange={(e) => set("health_benefit", e.target.value)}
                  placeholder="e.g. Energy and focus, gut health, sleep support"
                  className="w-full h-10 px-3 rounded-xl border border-[#d2d2d7] text-sm text-[#1d1d1f] placeholder:text-[#d2d2d7] focus:outline-none focus:border-[#0071e3] transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1d1d1f] mb-1.5">Target consumer</label>
                <input
                  value={answers.target_consumer}
                  onChange={(e) => set("target_consumer", e.target.value)}
                  placeholder="e.g. Women 25–45 interested in daily wellness"
                  className="w-full h-10 px-3 rounded-xl border border-[#d2d2d7] text-sm text-[#1d1d1f] placeholder:text-[#d2d2d7] focus:outline-none focus:border-[#0071e3] transition-colors"
                />
              </div>
            </div>
          )}

          {/* Step 2: Formulation */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#1d1d1f] mb-2">Do you have an existing formula?</label>
                <div className="flex flex-wrap gap-2">
                  {["Starting from scratch", "I have a full formula", "I have a partial brief"].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => set("existing_formula", opt)}
                      className={`px-4 py-2 rounded-xl text-sm border transition-colors ${answers.existing_formula === opt ? "bg-[#0071e3] text-white border-[#0071e3]" : "border-[#d2d2d7] text-[#1d1d1f] hover:border-[#0071e3]"}`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1d1d1f] mb-1.5">Key ingredients you'd like included</label>
                <textarea
                  value={answers.ingredients_wanted}
                  onChange={(e) => set("ingredients_wanted", e.target.value)}
                  placeholder="e.g. Ashwagandha, Lion's Mane, Vitamin D3"
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl border border-[#d2d2d7] text-sm text-[#1d1d1f] placeholder:text-[#d2d2d7] focus:outline-none focus:border-[#0071e3] transition-colors resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1d1d1f] mb-1.5">Ingredients to avoid</label>
                <input
                  value={answers.ingredients_avoid}
                  onChange={(e) => set("ingredients_avoid", e.target.value)}
                  placeholder="e.g. Gelatin, artificial colours, caffeine"
                  className="w-full h-10 px-3 rounded-xl border border-[#d2d2d7] text-sm text-[#1d1d1f] placeholder:text-[#d2d2d7] focus:outline-none focus:border-[#0071e3] transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1d1d1f] mb-2">Certifications required</label>
                <div className="flex flex-wrap gap-2">
                  {["Vegan", "Organic", "Halal", "Kosher", "Non-GMO", "Gluten-free"].map((cert) => (
                    <button
                      key={cert}
                      onClick={() => toggleCert(cert)}
                      className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${answers.certifications.includes(cert) ? "bg-[#0071e3] text-white border-[#0071e3]" : "border-[#d2d2d7] text-[#1d1d1f] hover:border-[#0071e3]"}`}
                    >
                      {cert}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1d1d1f] mb-2">Flavour preference <span className="text-[#86868b] font-normal">(if applicable)</span></label>
                <div className="flex flex-wrap gap-2">
                  {["Sweet", "Fruity", "Sour", "Unflavoured", "Not applicable"].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => set("flavour", opt)}
                      className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${answers.flavour === opt ? "bg-[#0071e3] text-white border-[#0071e3]" : "border-[#d2d2d7] text-[#1d1d1f] hover:border-[#0071e3]"}`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Market */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#1d1d1f] mb-2">Primary sales channel</label>
                <div className="flex flex-wrap gap-2">
                  {["DTC / own website", "Amazon", "Retail", "Pharmacy", "Gym / sports", "Export / wholesale"].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => set("sales_channel", opt)}
                      className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${answers.sales_channel === opt ? "bg-[#0071e3] text-white border-[#0071e3]" : "border-[#d2d2d7] text-[#1d1d1f] hover:border-[#0071e3]"}`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1d1d1f] mb-2">Do you need label compliance support?</label>
                <div className="flex gap-2">
                  {["Yes", "No", "Not sure"].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => set("label_compliance", opt)}
                      className={`px-4 py-2 rounded-xl text-sm border transition-colors ${answers.label_compliance === opt ? "bg-[#0071e3] text-white border-[#0071e3]" : "border-[#d2d2d7] text-[#1d1d1f] hover:border-[#0071e3]"}`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: References */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#1d1d1f] mb-1.5">Competitor or reference products</label>
                <p className="text-xs text-[#86868b] mb-2">What products do you like? What do you want to do differently?</p>
                <textarea
                  value={answers.references}
                  onChange={(e) => set("references", e.target.value)}
                  placeholder="e.g. Love the packaging of X, want better bioavailability than Y, aiming for a premium feel"
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl border border-[#d2d2d7] text-sm text-[#1d1d1f] placeholder:text-[#d2d2d7] focus:outline-none focus:border-[#0071e3] transition-colors resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1d1d1f] mb-1.5">Anything else we should know?</label>
                <textarea
                  value={answers.additional_notes}
                  onChange={(e) => set("additional_notes", e.target.value)}
                  placeholder="Budget constraints, hard deadlines, regulatory requirements, etc."
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl border border-[#d2d2d7] text-sm text-[#1d1d1f] placeholder:text-[#d2d2d7] focus:outline-none focus:border-[#0071e3] transition-colors resize-none"
                />
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6">
            <button
              onClick={() => setStep((s) => s - 1)}
              className={`text-sm text-[#86868b] hover:text-[#1d1d1f] transition-colors ${step === 0 ? "invisible" : ""}`}
            >
              ← Back
            </button>
            {step < CHECKLIST_STEPS.length - 1 ? (
              <button
                onClick={() => setStep((s) => s + 1)}
                className="h-9 px-5 rounded-xl bg-[#1d1d1f] text-white text-sm font-medium hover:bg-[#2d2d2f] transition-colors"
              >
                Next →
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="h-9 px-5 rounded-xl bg-[#0071e3] text-white text-sm font-medium hover:bg-[#0077ed] disabled:opacity-60 transition-colors"
              >
                {saving ? "Saving…" : "Submit brief →"}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Shared brief + booking section ──────────────────────────────────────────

function BriefSection({ deal, authHeaders, onRefresh }: { deal: Deal; authHeaders: any; onRefresh: () => void }) {
  const [briefOpen, setBriefOpen] = useState(false);
  const [step,      setStep]      = useState(0);
  const [saving,    setSaving]    = useState(false);
  const [saved,     setSaved]     = useState(deal.brief_submitted);
  const [skipping,  setSkipping]  = useState(false);

  const [answers, setAnswers] = useState({
    product_name: "", health_benefit: "", target_consumer: "",
    existing_formula: "", ingredients_wanted: "", ingredients_avoid: "",
    certifications: [] as string[], flavour: "",
    sales_channel: "", label_compliance: "", references: "", additional_notes: "",
  });

  const set = (key: keyof typeof answers, val: string | string[]) =>
    setAnswers((prev) => ({ ...prev, [key]: val }));
  const toggleCert = (cert: string) => {
    const cur = answers.certifications;
    set("certifications", cur.includes(cert) ? cur.filter((c) => c !== cert) : [...cur, cert]);
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await fetch("/api/portal/checklist", {
        method: "POST",
        headers: { ...(authHeaders as Record<string, string>), "Content-Type": "application/json" },
        body: JSON.stringify({ dealId: deal.id, answers }),
      });
      setSaved(true);
      onRefresh();
    } finally { setSaving(false); }
  };

  const handleSkip = async () => {
    if (!confirm("Skip the discovery call and go straight to Initial Brief? Our team will be in touch shortly.")) return;
    setSkipping(true);
    try {
      const res = await fetch("/api/portal/skip-call", {
        method: "POST",
        headers: { ...(authHeaders as Record<string, string>), "Content-Type": "application/json" },
        body: JSON.stringify({ dealId: deal.id }),
      });
      const data = await res.json();
      if (data.success) onRefresh();
    } finally { setSkipping(false); }
  };

  if (saved) {
    return (
      <div className="border-t border-green-100 bg-green-50 px-6 py-4 flex items-center gap-3">
        <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center shrink-0">
          <svg className="w-3.5 h-3.5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-green-800">Brief received — we'll come prepared.</p>
          <p className="text-xs text-green-700 mt-0.5">Your team will review this before the call.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="border-t border-[#f5f5f7]">
      {/* Equal-weight action cards */}
      <div className={`p-4 grid gap-3 ${deal.stage === "New Enquiry" ? "grid-cols-2" : "grid-cols-1"}`}>
        {/* Book a call — New Enquiry only */}
        {deal.stage === "New Enquiry" && (
          <button
            onClick={() => window.open("https://cal.eu/labelorigin/discovery-call", "_blank", "noopener,noreferrer")}
            className="text-left rounded-xl bg-[#1d1d1f] px-5 py-4 hover:bg-[#2d2d2f] transition-colors group"
          >
            <p className="text-[10px] font-semibold text-white/50 uppercase tracking-widest mb-1">Discovery call</p>
            <p className="text-sm font-semibold text-white">Book a call →</p>
          </button>
        )}
        {/* Pre-call brief */}
        <button
          onClick={() => setBriefOpen((o) => !o)}
          className="text-left rounded-xl bg-[#0071e3] px-5 py-4 hover:bg-[#0077ed] transition-colors"
        >
          <p className="text-[10px] font-semibold text-white/60 uppercase tracking-widest mb-1">Pre-call brief</p>
          <p className="text-sm font-semibold text-white">{briefOpen ? "Collapse ↑" : "Start brief →"}</p>
        </button>
      </div>

      {/* Skip link — New Enquiry only */}
      {deal.stage === "New Enquiry" && !briefOpen && (
        <div className="px-4 pb-3 text-center">
          <button onClick={handleSkip} disabled={skipping} className="text-xs text-[#86868b] hover:text-[#1d1d1f] underline underline-offset-2 transition-colors disabled:opacity-50">
            {skipping ? "Updating…" : "Already have a clear brief? Skip the call →"}
          </button>
        </div>
      )}

      {/* Expanded brief form */}
      {briefOpen && (
        <div className="px-6 pb-6 bg-white border-t border-[#f5f5f7]">
          <div className="flex gap-1.5 mt-5 mb-5">
            {CHECKLIST_STEPS.map((s, i) => (
              <div key={s.id} className={`h-1 flex-1 rounded-full transition-colors ${i <= step ? "bg-[#0071e3]" : "bg-[#d2d2d7]"}`} />
            ))}
          </div>
          <p className="text-xs font-semibold text-[#86868b] uppercase tracking-widest mb-4">
            {step + 1} of {CHECKLIST_STEPS.length} — {CHECKLIST_STEPS[step].label}
          </p>

          {step === 0 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#1d1d1f] mb-1.5">Product name <span className="text-[#86868b] font-normal">(if you have one)</span></label>
                <input value={answers.product_name} onChange={(e) => set("product_name", e.target.value)} placeholder="e.g. Clarity Co. Focus Gummies" className="w-full h-10 px-3 rounded-xl border border-[#d2d2d7] text-sm text-[#1d1d1f] placeholder:text-[#d2d2d7] focus:outline-none focus:border-[#0071e3] transition-colors" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1d1d1f] mb-1.5">Primary health benefit or claim</label>
                <input value={answers.health_benefit} onChange={(e) => set("health_benefit", e.target.value)} placeholder="e.g. Energy and focus, gut health, sleep support" className="w-full h-10 px-3 rounded-xl border border-[#d2d2d7] text-sm text-[#1d1d1f] placeholder:text-[#d2d2d7] focus:outline-none focus:border-[#0071e3] transition-colors" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1d1d1f] mb-1.5">Target consumer</label>
                <input value={answers.target_consumer} onChange={(e) => set("target_consumer", e.target.value)} placeholder="e.g. Women 25–45 interested in daily wellness" className="w-full h-10 px-3 rounded-xl border border-[#d2d2d7] text-sm text-[#1d1d1f] placeholder:text-[#d2d2d7] focus:outline-none focus:border-[#0071e3] transition-colors" />
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#1d1d1f] mb-2">Do you have an existing formula?</label>
                <div className="flex flex-wrap gap-2">
                  {["Starting from scratch", "I have a full formula", "I have a partial brief"].map((opt) => (
                    <button key={opt} onClick={() => set("existing_formula", opt)} className={`px-4 py-2 rounded-xl text-sm border transition-colors ${answers.existing_formula === opt ? "bg-[#0071e3] text-white border-[#0071e3]" : "border-[#d2d2d7] text-[#1d1d1f] hover:border-[#0071e3]"}`}>{opt}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1d1d1f] mb-1.5">Key ingredients you'd like included</label>
                <textarea value={answers.ingredients_wanted} onChange={(e) => set("ingredients_wanted", e.target.value)} placeholder="e.g. Ashwagandha, Lion's Mane, Vitamin D3" rows={2} className="w-full px-3 py-2 rounded-xl border border-[#d2d2d7] text-sm text-[#1d1d1f] placeholder:text-[#d2d2d7] focus:outline-none focus:border-[#0071e3] transition-colors resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1d1d1f] mb-1.5">Ingredients to avoid</label>
                <input value={answers.ingredients_avoid} onChange={(e) => set("ingredients_avoid", e.target.value)} placeholder="e.g. Gelatin, artificial colours, caffeine" className="w-full h-10 px-3 rounded-xl border border-[#d2d2d7] text-sm text-[#1d1d1f] placeholder:text-[#d2d2d7] focus:outline-none focus:border-[#0071e3] transition-colors" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1d1d1f] mb-2">Certifications required</label>
                <div className="flex flex-wrap gap-2">
                  {["Vegan", "Organic", "Halal", "Kosher", "Non-GMO", "Gluten-free"].map((cert) => (
                    <button key={cert} onClick={() => toggleCert(cert)} className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${answers.certifications.includes(cert) ? "bg-[#0071e3] text-white border-[#0071e3]" : "border-[#d2d2d7] text-[#1d1d1f] hover:border-[#0071e3]"}`}>{cert}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1d1d1f] mb-2">Flavour preference <span className="text-[#86868b] font-normal">(if applicable)</span></label>
                <div className="flex flex-wrap gap-2">
                  {["Sweet", "Fruity", "Sour", "Unflavoured", "Not applicable"].map((opt) => (
                    <button key={opt} onClick={() => set("flavour", opt)} className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${answers.flavour === opt ? "bg-[#0071e3] text-white border-[#0071e3]" : "border-[#d2d2d7] text-[#1d1d1f] hover:border-[#0071e3]"}`}>{opt}</button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#1d1d1f] mb-2">Primary sales channel</label>
                <div className="flex flex-wrap gap-2">
                  {["DTC / own website", "Amazon", "Retail", "Pharmacy", "Gym / sports", "Export / wholesale"].map((opt) => (
                    <button key={opt} onClick={() => set("sales_channel", opt)} className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${answers.sales_channel === opt ? "bg-[#0071e3] text-white border-[#0071e3]" : "border-[#d2d2d7] text-[#1d1d1f] hover:border-[#0071e3]"}`}>{opt}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1d1d1f] mb-2">Do you need label compliance support?</label>
                <div className="flex gap-2">
                  {["Yes", "No", "Not sure"].map((opt) => (
                    <button key={opt} onClick={() => set("label_compliance", opt)} className={`px-4 py-2 rounded-xl text-sm border transition-colors ${answers.label_compliance === opt ? "bg-[#0071e3] text-white border-[#0071e3]" : "border-[#d2d2d7] text-[#1d1d1f] hover:border-[#0071e3]"}`}>{opt}</button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#1d1d1f] mb-1.5">Competitor or reference products</label>
                <p className="text-xs text-[#86868b] mb-2">What products do you like? What do you want to do differently?</p>
                <textarea value={answers.references} onChange={(e) => set("references", e.target.value)} placeholder="e.g. Love the packaging of X, want better bioavailability than Y" rows={3} className="w-full px-3 py-2 rounded-xl border border-[#d2d2d7] text-sm text-[#1d1d1f] placeholder:text-[#d2d2d7] focus:outline-none focus:border-[#0071e3] transition-colors resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1d1d1f] mb-1.5">Anything else we should know?</label>
                <textarea value={answers.additional_notes} onChange={(e) => set("additional_notes", e.target.value)} placeholder="Budget constraints, hard deadlines, regulatory requirements, etc." rows={2} className="w-full px-3 py-2 rounded-xl border border-[#d2d2d7] text-sm text-[#1d1d1f] placeholder:text-[#d2d2d7] focus:outline-none focus:border-[#0071e3] transition-colors resize-none" />
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mt-6">
            <button onClick={() => setStep((s) => s - 1)} className={`text-sm text-[#86868b] hover:text-[#1d1d1f] transition-colors ${step === 0 ? "invisible" : ""}`}>← Back</button>
            {step < CHECKLIST_STEPS.length - 1 ? (
              <button onClick={() => setStep((s) => s + 1)} className="h-9 px-5 rounded-xl bg-[#1d1d1f] text-white text-sm font-medium hover:bg-[#2d2d2f] transition-colors">Next →</button>
            ) : (
              <button onClick={handleSubmit} disabled={saving} className="h-9 px-5 rounded-xl bg-[#0071e3] text-white text-sm font-medium hover:bg-[#0077ed] disabled:opacity-60 transition-colors">{saving ? "Saving…" : "Submit brief →"}</button>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

// ─── Deal card (overview — compact progress + brief) ──────────────────────────

function DealCard({ deal, authHeaders, onRefresh, onTabChange }: { deal: Deal; authHeaders: any; onRefresh: () => void; onTabChange: (t: TabId) => void }) {
  const needsAction = deal.stage === "New Enquiry" || deal.stage === "Discovery Call Booked" || deal.stage === "Initial Brief";

  return (
    <div className="rounded-2xl border border-[#d2d2d7] bg-white overflow-hidden">
      {/* Progress section — clickable, goes to My Orders */}
      <button
        onClick={() => onTabChange("orders")}
        className="w-full text-left px-6 pt-5 pb-5 hover:bg-[#f9f9f9] transition-colors group"
      >
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <p className="text-xs font-semibold text-[#86868b] uppercase tracking-widest mb-1">Active order</p>
            <h3 className="text-base font-semibold text-[#1d1d1f] group-hover:text-[#0071e3] transition-colors">{deal.name}</h3>
            {deal.product_format && <p className="text-sm text-[#86868b] mt-0.5">{deal.product_format}</p>}
          </div>
          <span className={`shrink-0 text-[11px] font-medium px-2.5 py-1 rounded-full mt-1 ${
            deal.stage === "Discovery Call Booked" ? "bg-blue-50 text-[#0071e3]" : "bg-[#f5f5f7] text-[#86868b]"
          }`}>{deal.current_stage}</span>
        </div>
        <div className="relative mb-2">
          <div className="h-1.5 w-full rounded-full bg-[#f5f5f7]" />
          <div className="absolute top-0 left-0 h-1.5 rounded-full bg-[#0071e3] transition-all duration-700" style={{ width: `${deal.stage_percent}%` }} />
        </div>
        <div className="flex justify-between text-[11px] text-[#86868b]">
          <span>New Enquiry</span>
          <span>{deal.stage_percent}% complete</span>
          <span>Delivered</span>
        </div>
      </button>

      {/* Brief + booking section */}
      {needsAction && <BriefSection deal={deal} authHeaders={authHeaders} onRefresh={onRefresh} />}
    </div>
  );
}

function OverviewTab({ deals, invoices, onTabChange, authHeaders, onRefresh }: { deals: Deal[]; invoices: Invoice[]; onTabChange: (t: TabId) => void; authHeaders: any; onRefresh: () => void }) {
  const activeDeals = deals.filter((d) => d.stage !== "Closed / Completed" && d.stage !== "Lost / Declined");
  const overdueInvoices = invoices.filter((i) => i.status === "overdue");
  const totalSpend = invoices.filter((i) => i.status === "paid").reduce((sum, i) => sum + Number(i.total), 0);

  return (
    <div className="space-y-6">

      {/* Overdue alert */}
      {overdueInvoices.length > 0 && (
        <div className="rounded-2xl bg-red-50 border border-red-200 px-5 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-red-800">
              {overdueInvoices.length} overdue invoice{overdueInvoices.length > 1 ? "s" : ""} — please settle to avoid delays to your order.
            </p>
          </div>
          <button onClick={() => onTabChange("invoices")} className="shrink-0 text-xs font-semibold text-red-700 hover:underline">
            View →
          </button>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Active orders",    value: String(activeDeals.length)       },
          { label: "Total orders",     value: String(deals.length)             },
          { label: "Total invoiced",   value: fmt(totalSpend, 0)               },
          { label: "Open invoices",    value: String(invoices.filter(i => i.status === "sent" || i.status === "partially_paid").length) },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-[#d2d2d7] bg-white p-5">
            <p className="text-xs text-[#86868b] mb-1">{stat.label}</p>
            <p className="text-2xl font-semibold text-[#1d1d1f]">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Active orders — one card per deal */}
      {activeDeals.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-[#86868b] uppercase tracking-widest">Your orders</p>
            <button onClick={() => onTabChange("orders")} className="text-xs text-[#0071e3] hover:underline">View all →</button>
          </div>
          {activeDeals.map((deal) => (
            <DealCard key={deal.id} deal={deal} authHeaders={authHeaders} onRefresh={onRefresh} onTabChange={onTabChange} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-[#d2d2d7] bg-white p-10 text-center">
          <p className="text-[#86868b] mb-4">No active orders yet.</p>
          <Link
            href="/#brief"
            className="inline-block h-10 px-6 rounded-xl bg-[#0071e3] text-white text-sm font-medium hover:bg-[#0077ed] transition-colors leading-10"
          >
            Build your brief →
          </Link>
        </div>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Browse catalogue",  desc: "View available formats, MOQs and lead times.", tab: "catalogue" as TabId },
          { label: "View invoices",     desc: "Check payment status and outstanding balances.", tab: "invoices"  as TabId },
          { label: "Your documents",    desc: "COAs, spec sheets and regulatory files.",        tab: "documents" as TabId },
        ].map((a) => (
          <button
            key={a.label}
            onClick={() => onTabChange(a.tab)}
            className="text-left rounded-2xl border border-[#d2d2d7] bg-white p-5 hover:border-[#0071e3] hover:bg-[#0071e3]/[0.02] transition-all group"
          >
            <p className="text-sm font-semibold text-[#1d1d1f] group-hover:text-[#0071e3] transition-colors mb-1">{a.label} →</p>
            <p className="text-xs text-[#86868b] leading-relaxed">{a.desc}</p>
          </button>
        ))}
      </div>

    </div>
  );
}

// ─── Orders tab ───────────────────────────────────────────────────────────────

function OrdersTab({ deals, authHeaders, onRefresh }: { deals: Deal[]; authHeaders: any; onRefresh: () => void }) {
  const [accepting, setAccepting] = useState(false);

  const handleAccept = async (dealId: string) => {
    if (!confirm("Accept this proposal?")) return;
    setAccepting(true);
    try {
      const res = await fetch("/api/portal/accept-proposal", {
        method: "POST",
        headers: { ...(authHeaders as Record<string, string>), "Content-Type": "application/json" },
        body: JSON.stringify({ dealId }),
      });
      const data = await res.json();
      if (data.success) onRefresh();
    } finally {
      setAccepting(false);
    }
  };

  if (deals.length === 0) {
    return (
      <div className="rounded-2xl border border-[#d2d2d7] bg-white p-16 text-center">
        <p className="text-[#86868b] mb-4">No orders yet.</p>
        <Link href="/#brief" className="inline-block h-10 px-6 rounded-xl bg-[#0071e3] text-white text-sm font-medium hover:bg-[#0077ed] transition-colors leading-10">
          Build your brief →
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {deals.map((deal) => {
        const isProposalSent = deal.stage === "Proposal Sent";
        const isComplete = deal.stage === "Closed / Completed";

        return (
          <div key={deal.id} className="rounded-2xl border border-[#d2d2d7] bg-white overflow-hidden">
            {/* Header */}
            <div className="px-6 pt-6 pb-4 border-b border-[#f5f5f7]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-[#1d1d1f]">{deal.name}</h3>
                  <p className="text-xs text-[#86868b] mt-0.5">
                    {deal.product_format && <span className="mr-3">{deal.product_format}</span>}
                    {deal.moq && <span>MOQ: {deal.moq.toLocaleString()} units</span>}
                  </p>
                </div>
                <span className={`shrink-0 text-[10px] font-semibold uppercase tracking-wide px-3 py-1 rounded-full ${
                  isComplete ? "bg-green-100 text-green-700" :
                  isProposalSent ? "bg-[#0071e3]/10 text-[#0071e3]" :
                  "bg-[#f5f5f7] text-[#86868b]"
                }`}>
                  {deal.stage}
                </span>
              </div>
            </div>

            {/* Pipeline timeline */}
            <div className="px-6 py-5">
              <div className="relative mb-4">
                <div className="h-1 w-full rounded-full bg-[#f5f5f7]" />
                <div
                  className={`absolute top-0 left-0 h-1 rounded-full transition-all duration-700 ${isComplete ? "bg-green-500" : "bg-[#0071e3]"}`}
                  style={{ width: `${deal.stage_percent}%` }}
                />
              </div>

              {/* Stage chips */}
              <div className="flex flex-wrap gap-1.5">
                {STAGE_ORDER.map((s) => {
                  const done = deal.completed_stages.includes(s);
                  const active = s === deal.current_stage;
                  return (
                    <span
                      key={s}
                      className={`text-[10px] font-medium px-2.5 py-1 rounded-full transition-colors ${
                        done   ? "bg-green-100 text-green-700" :
                        active ? "bg-[#0071e3] text-white" :
                                 "bg-[#f5f5f7] text-[#d2d2d7]"
                      }`}
                    >
                      {s}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Pricing row */}
            {deal.wholesale_price && (
              <div className="px-6 pb-5 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                {[
                  { label: "Cost / unit",    value: fmt(deal.wholesale_price)  },
                  { label: "Suggested RRP",  value: fmt(deal.suggested_rrp)    },
                  { label: "Order total",    value: fmt(deal.quote_total, 0)   },
                  { label: "Your margin",    value: deal.client_margin ? `${deal.client_margin}%` : "—" },
                ].map((row) => (
                  <div key={row.label}>
                    <p className="text-[11px] text-[#86868b] mb-0.5">{row.label}</p>
                    <p className="font-semibold text-[#1d1d1f]">{row.value}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Accept proposal */}
            {isProposalSent && (
              <div className="px-6 pb-6">
                <button
                  onClick={() => handleAccept(deal.id)}
                  disabled={accepting}
                  className="w-full h-11 rounded-xl bg-green-600 text-white text-sm font-medium hover:bg-green-700 disabled:opacity-60 transition-colors"
                >
                  {accepting ? "Processing…" : "Accept Proposal"}
                </button>
              </div>
            )}

            {/* Pre-call brief — New Enquiry / Discovery Call Booked / Initial Brief */}
            {(deal.stage === "New Enquiry" || deal.stage === "Discovery Call Booked" || deal.stage === "Initial Brief") && (
              <BriefSection deal={deal} authHeaders={authHeaders} onRefresh={onRefresh} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Catalogue tab ────────────────────────────────────────────────────────────

function CatalogueTab() {
  const [section,   setSection]   = useState<"formats" | "ingredients" | "blends">("formats");
  const [activeCat, setActiveCat] = useState("nootropics");

  const cat = INGREDIENT_CATEGORIES.find((c) => c.id === activeCat)!;

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="rounded-2xl bg-[#1d1d1f] text-white px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-white/50 uppercase tracking-widest mb-1">Label Origin · Catalogue 2026</p>
          <p className="font-semibold">UK-manufactured · ISO9001 · hfma member</p>
        </div>
        <Link
          href="/#brief"
          className="shrink-0 h-10 px-6 rounded-xl bg-[#0071e3] text-white text-sm font-medium hover:bg-[#0077ed] transition-colors leading-10 text-center"
        >
          Request a quote
        </Link>
      </div>

      {/* Section picker */}
      <div className="flex gap-1 bg-[#f5f5f7] rounded-2xl p-1">
        {(["formats", "ingredients", "blends"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setSection(s)}
            className={`flex-1 h-9 rounded-xl text-sm font-medium transition-all ${
              section === s ? "bg-white text-[#1d1d1f] shadow-sm" : "text-[#86868b] hover:text-[#1d1d1f]"
            }`}
          >
            {s === "formats" ? "Product Formats" : s === "ingredients" ? "Ingredients" : "Example Blends"}
          </button>
        ))}
      </div>

      {/* ── FORMATS ── */}
      {section === "formats" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {FORMATS.map((item) => (
            <div key={item.id} className="rounded-2xl border border-[#d2d2d7] bg-white overflow-hidden hover:border-[#0071e3]/40 transition-colors">
              <div className="px-6 pt-6 pb-4 border-b border-[#f5f5f7]">
                <h3 className="font-semibold text-[#1d1d1f] mb-0.5">{item.format}</h3>
                <p className="text-xs text-[#0071e3] font-medium">{item.tagline}</p>
              </div>
              <div className="px-6 py-4 space-y-4">
                <p className="text-xs text-[#86868b] leading-relaxed">{item.description}</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "MOQ",          value: item.moq        },
                    { label: "Lead time",    value: item.leadTime   },
                    { label: "Active load",  value: item.activeLoad },
                    { label: "Serving size", value: item.servingSize },
                  ].map((spec) => (
                    <div key={spec.label} className="rounded-xl bg-[#f5f5f7] px-3 py-2.5">
                      <p className="text-[10px] text-[#86868b] uppercase tracking-wide mb-0.5">{spec.label}</p>
                      <p className="text-xs font-semibold text-[#1d1d1f]">{spec.value}</p>
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {item.highlights.map((h) => (
                    <span key={h} className="text-[10px] font-medium px-2.5 py-1 rounded-full bg-[#0071e3]/8 text-[#0071e3]">
                      {h}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── INGREDIENTS ── */}
      {section === "ingredients" && (
        <div className="space-y-5">

          {/* Category pills */}
          <div className="flex flex-wrap gap-2">
            {INGREDIENT_CATEGORIES.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveCat(c.id)}
                className={`h-8 px-4 rounded-full text-sm font-medium transition-all border ${
                  activeCat === c.id
                    ? "bg-[#1d1d1f] text-white border-[#1d1d1f]"
                    : c.restricted
                    ? "bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100"
                    : "bg-[#f5f5f7] text-[#86868b] border-transparent hover:text-[#1d1d1f]"
                }`}
              >
                {c.label}{c.restricted && " ⚠"}
              </button>
            ))}
          </div>

          {/* CBD restriction notice */}
          {cat.restricted && (
            <div className="rounded-2xl bg-amber-50 border border-amber-200 px-5 py-4 flex gap-3">
              <svg className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
              <div>
                <p className="text-sm font-semibold text-amber-800 mb-0.5">Authorisation required</p>
                <p className="text-xs text-amber-700 leading-relaxed">
                  CBD and cannabinoid products require prior authorisation and regulatory review before we can proceed with formulation. Please speak to your account manager before enquiring for these ingredients.
                </p>
              </div>
            </div>
          )}

          {/* Category heading */}
          <div>
            <h3 className="font-semibold text-[#1d1d1f]">{cat.label}</h3>
            <p className="text-xs text-[#86868b]">{cat.tagline} · {cat.ingredients.length} ingredients</p>
          </div>

          {/* Ingredient grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {cat.ingredients.map((ing) => (
              <div key={ing.name} className="rounded-2xl border border-[#d2d2d7] bg-white overflow-hidden group hover:border-[#0071e3]/30 hover:shadow-sm transition-all duration-200">
                {/* Image — object-cover fills the card; bg-white matches the catalogue's card interior */}
                <div className="h-44 bg-white overflow-hidden">
                  <img
                    src={ing.img}
                    alt={ing.name}
                    className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-300"
                    onError={(e) => { (e.currentTarget.parentElement as HTMLDivElement).style.background = "#f5f5f7"; (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                  />
                </div>
                {/* Text */}
                <div className="px-4 py-3 border-t border-[#e8e5e0]">
                  <p className="text-sm font-semibold text-[#1d1d1f] mb-1 leading-snug">{ing.name}</p>
                  <p className="text-[11px] text-[#86868b] leading-relaxed">{ing.benefit}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── BLENDS ── */}
      {section === "blends" && (
        <div className="space-y-4">
          <p className="text-xs text-[#86868b]">
            Pre-formulated starting points developed by our in-house formulators. All dosages are adjustable — speak to your account manager to tailor any blend to your brand positioning.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {BLENDS.map((blend) => (
              <div key={blend.id} className="rounded-2xl border border-[#d2d2d7] bg-white px-5 py-4">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <h4 className="font-semibold text-[#1d1d1f]">{blend.goal}</h4>
                  <span className="text-[10px] font-medium px-2.5 py-1 rounded-full bg-[#0071e3]/8 text-[#0071e3] shrink-0 whitespace-nowrap">
                    {blend.format}
                  </span>
                </div>
                <div className="space-y-2">
                  {blend.ingredients.map((ing) => (
                    <div key={ing.name} className="flex items-center justify-between gap-2 border-b border-[#f5f5f7] pb-2 last:border-0 last:pb-0">
                      <p className="text-xs text-[#1d1d1f]">{ing.name}</p>
                      <p className="text-xs font-semibold text-[#86868b] shrink-0 font-mono">{ing.dose}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}

// ─── Documents tab ────────────────────────────────────────────────────────────

function DocumentsTab({ deals }: { deals: Deal[] }) {
  const hasOrders = deals.length > 0;
  const inProduction = deals.filter((d) =>
    ["Sample Development", "Sample Approved", "Deposit Invoiced", "In Production", "Final Balance Invoiced", "Shipped / Delivery", "Closed / Completed"].includes(d.stage)
  );

  const DOC_TYPES = [
    { icon: "📋", label: "Certificate of Analysis (COA)",     desc: "Independent UKAS-accredited lab results for each batch."     },
    { icon: "📄", label: "Product Specification Sheet",       desc: "Full ingredient list, actives, allergens, and format specs." },
    { icon: "🧪", label: "Stability Report",                  desc: "Shelf-life data under ICH storage conditions."              },
    { icon: "⚖️", label: "Regulatory Compliance Declaration", desc: "EU & UK Food Supplements Directive compliance."             },
    { icon: "🏭", label: "Manufacturing Record",              desc: "Batch number, production date, and QA sign-off."            },
    { icon: "📦", label: "Packaging Specification",           desc: "Artwork-ready dielines, barcode data, and label copy."      },
  ];

  return (
    <div className="space-y-5">
      {/* Info banner */}
      <div className="rounded-2xl border border-[#d2d2d7] bg-[#f5f5f7] px-6 py-5 flex gap-4">
        <svg className="w-5 h-5 text-[#0071e3] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>
          <p className="text-sm font-medium text-[#1d1d1f] mb-0.5">Documents are added as your order progresses</p>
          <p className="text-xs text-[#86868b] leading-relaxed">
            {hasOrders
              ? "Your COAs, spec sheets and regulatory documents will appear here once your order reaches the relevant stage. Your account manager will notify you when new documents are available."
              : "Once you have an active order, your COAs, spec sheets, and compliance documents will be stored here for easy access."}
          </p>
        </div>
      </div>

      {/* Active order docs */}
      {inProduction.map((deal) => (
        <div key={deal.id} className="rounded-2xl border border-[#d2d2d7] bg-white p-6">
          <p className="text-xs font-semibold text-[#86868b] uppercase tracking-widest mb-1">{deal.name}</p>
          <p className="text-sm text-[#1d1d1f] font-medium mb-4">{deal.current_stage}</p>
          <div className="space-y-2">
            {DOC_TYPES.map((doc) => (
              <div key={doc.label} className="flex items-center justify-between py-3 border-b border-[#f5f5f7] last:border-0">
                <div className="flex items-center gap-3">
                  <span className="text-base">{doc.icon}</span>
                  <div>
                    <p className="text-sm font-medium text-[#1d1d1f]">{doc.label}</p>
                    <p className="text-xs text-[#86868b]">{doc.desc}</p>
                  </div>
                </div>
                <span className="text-[10px] font-medium text-[#d2d2d7] uppercase tracking-wide shrink-0 ml-4">Pending</span>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Document types (if no production orders yet) */}
      {inProduction.length === 0 && (
        <div className="rounded-2xl border border-[#d2d2d7] bg-white p-6">
          <p className="text-xs font-semibold text-[#86868b] uppercase tracking-widest mb-4">What you'll receive</p>
          <div className="space-y-0">
            {DOC_TYPES.map((doc) => (
              <div key={doc.label} className="flex items-center gap-3 py-3 border-b border-[#f5f5f7] last:border-0">
                <span className="text-base">{doc.icon}</span>
                <div>
                  <p className="text-sm font-medium text-[#1d1d1f]">{doc.label}</p>
                  <p className="text-xs text-[#86868b]">{doc.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Invoices tab ─────────────────────────────────────────────────────────────

function InvoicesTab({ invoices }: { invoices: Invoice[] }) {
  if (invoices.length === 0) {
    return (
      <div className="rounded-2xl border border-[#d2d2d7] bg-white p-16 text-center">
        <p className="text-[#86868b]">No invoices yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {invoices.map((inv) => (
        <div key={inv.id} className="rounded-2xl border border-[#d2d2d7] bg-white px-6 py-5 flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <p className="font-semibold text-[#1d1d1f] text-sm">{inv.number}</p>
              <StatusBadge status={inv.status} />
            </div>
            <p className="text-xs text-[#86868b]">
              Issued {inv.date}
              {inv.due_date && <> · Due {inv.due_date}</>}
              {inv.reference && <> · Ref: {inv.reference}</>}
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="font-semibold text-[#1d1d1f]">{inv.currency} {Number(inv.total).toLocaleString("en-GB", { minimumFractionDigits: 2 })}</p>
            {Number(inv.balance) > 0 && inv.status !== "paid" && (
              <p className="text-xs text-[#86868b] mt-0.5">
                Balance: {inv.currency} {Number(inv.balance).toLocaleString("en-GB", { minimumFractionDigits: 2 })}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main portal ──────────────────────────────────────────────────────────────

export function ClientPortal({ className = "" }: { className?: string }) {
  const { session, isLoading, checking, error, sendMagicLink, logout, authHeaders } = useAuth();
  const [deals, setDeals]       = useState<Deal[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [dataLoading, setDataLoading] = useState(false);

  const fetchData = () => {
    if (!session) return;
    setDataLoading(true);
    const headers = authHeaders as Record<string, string>;
    Promise.all([
      fetch("/api/portal/deals",    { headers }).then((r) => r.json()),
      fetch("/api/portal/invoices", { headers }).then((r) => r.json()),
    ])
      .then(([d, i]) => {
        setDeals(d.deals       || []);
        setInvoices(i.invoices || []);
      })
      .catch(console.error)
      .finally(() => setDataLoading(false));
  };

  useEffect(() => { fetchData(); }, [session]);

  // Initial mount: checking localStorage / verifying magic-link token
  if (checking) {
    return (
      <div className={`${className} flex items-center justify-center py-32`}>
        <div className="w-8 h-8 rounded-full border-2 border-[#d2d2d7] border-t-[#0071e3] animate-spin" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className={className}>
        <LoginScreen onSendLink={sendMagicLink} isLoading={isLoading} error={error} />
      </div>
    );
  }

  const firstName = session.email.split("@")[0].split(".")[0];
  const displayName = firstName.charAt(0).toUpperCase() + firstName.slice(1);

  return (
    <div className={className}>
      {/* Portal header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-xs font-medium text-[#86868b] uppercase tracking-[0.3em] mb-1">(Client Portal)</p>
          <h2 className="text-2xl font-semibold text-[#1d1d1f]">Welcome back, {displayName}.</h2>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={fetchData}
            title="Refresh"
            className="text-xs text-[#86868b] hover:text-[#1d1d1f] transition-colors"
          >
            ↻ Refresh
          </button>
          <button onClick={logout} className="text-xs text-[#86868b] hover:text-[#1d1d1f] transition-colors">
            Sign out
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[#f5f5f7] rounded-2xl p-1 mb-8 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 min-w-fit h-9 px-4 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? "bg-white text-[#1d1d1f] shadow-sm"
                : "text-[#86868b] hover:text-[#1d1d1f]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {dataLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 rounded-full border-2 border-[#d2d2d7] border-t-[#0071e3] animate-spin" />
        </div>
      ) : (
        <>
          {activeTab === "overview"   && <OverviewTab  deals={deals} invoices={invoices} onTabChange={setActiveTab} authHeaders={authHeaders} onRefresh={fetchData} />}
          {activeTab === "orders"     && <OrdersTab    deals={deals} authHeaders={authHeaders} onRefresh={fetchData} />}
          {activeTab === "catalogue"  && <CatalogueTab />}
          {activeTab === "documents"  && <DocumentsTab deals={deals} />}
          {activeTab === "invoices"   && <InvoicesTab  invoices={invoices} />}
        </>
      )}
    </div>
  );
}
