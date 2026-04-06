"use client";

import { useState } from "react";

const FORMATS = [
  { value: "Gummies", label: "Gummies", defaultUnits: 60 },
  { value: "Capsules", label: "Capsules", defaultUnits: 60 },
  { value: "Soft_Gels", label: "Soft Gels", defaultUnits: 60 },
  { value: "Powders", label: "Powders (grams)", defaultUnits: 300 },
  { value: "Tinctures", label: "Tinctures (ml)", defaultUnits: 30 },
  { value: "Ready_to_Drink", label: "Ready to Drink (ml)", defaultUnits: 500 },
  { value: "Tablets", label: "Tablets", defaultUnits: 90 },
];

interface QuoteResult {
  format: string;
  units_per_product: number;
  num_ingredients: number;
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

const positionStyles: Record<string, { pill: string; label: string }> = {
  Budget:         { pill: "bg-green-100 text-green-700 border-green-200",   label: "Budget" },
  "Mid-Range":    { pill: "bg-[#0071e3]/10 text-[#0071e3] border-[#0071e3]/20", label: "Mid-Range" },
  Premium:        { pill: "bg-purple-100 text-purple-700 border-purple-200", label: "Premium" },
  "Above Market": { pill: "bg-red-100 text-red-700 border-red-200",         label: "Above Market" },
};

export function QuoteCalculator({ className = "" }: { className?: string }) {
  const [isCalculating, setIsCalculating] = useState(false);
  const [result, setResult] = useState<QuoteResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    product_format: "Gummies",
    units_per_product: 60,
    num_ingredients: 3,
    order_quantity: 500,
  });

  const update = (field: string, value: string | number) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleFormatChange = (format: string) => {
    const f = FORMATS.find((ff) => ff.value === format);
    setForm((prev) => ({ ...prev, product_format: format, units_per_product: f?.defaultUnits || 60 }));
  };

  const calculate = async () => {
    setIsCalculating(true);
    setError(null);
    try {
      const res = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) setResult(data.estimate);
      else setError(data.error || "Could not calculate.");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsCalculating(false);
    }
  };

  const inputClass = "w-full h-11 rounded-xl border border-[#d2d2d7] bg-[#f5f5f7] px-4 text-sm text-[#1d1d1f] focus:outline-none focus:ring-2 focus:ring-[#0071e3] focus:border-transparent transition appearance-none";
  const labelClass = "block text-xs font-medium text-[#1d1d1f] uppercase tracking-wide mb-1.5";

  return (
    <div className={className}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
        <div>
          <label className={labelClass}>Product Format</label>
          <select value={form.product_format} onChange={(e) => handleFormatChange(e.target.value)} className={inputClass}>
            {FORMATS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
          </select>
        </div>

        <div>
          <label className={labelClass}>Units per Product</label>
          <input
            type="number"
            min="1"
            value={form.units_per_product}
            onChange={(e) => update("units_per_product", parseInt(e.target.value) || 1)}
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>
            Ingredients — <span className="text-[#0071e3] normal-case font-semibold">{form.num_ingredients}</span>
          </label>
          <input
            type="range"
            min="1"
            max="10"
            value={form.num_ingredients}
            onChange={(e) => update("num_ingredients", parseInt(e.target.value))}
            className="w-full accent-[#0071e3] mt-2"
          />
          <div className="flex justify-between text-[10px] text-[#86868b] mt-1">
            <span>1</span><span>5</span><span>10</span>
          </div>
        </div>

        <div>
          <label className={labelClass}>Order Quantity</label>
          <select value={form.order_quantity} onChange={(e) => update("order_quantity", parseInt(e.target.value))} className={inputClass}>
            <option value={500}>500 units</option>
            <option value={1000}>1,000 units</option>
            <option value={2000}>2,000 units</option>
            <option value={5000}>5,000 units</option>
            <option value={10000}>10,000 units</option>
          </select>
        </div>
      </div>

      <button
        onClick={calculate}
        disabled={isCalculating}
        className="w-full h-12 rounded-xl bg-[#0071e3] text-white text-sm font-medium hover:bg-[#0077ed] active:bg-[#006edb] disabled:opacity-60 transition-colors"
      >
        {isCalculating ? "Calculating…" : "Get estimate"}
      </button>

      {error && <p className="mt-4 text-red-600 text-sm">{error}</p>}

      {result && (
        <div className="mt-8 space-y-5">
          {/* Result header */}
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-[#1d1d1f]">Your estimate</h3>
            <span className={`text-xs font-medium px-3 py-1 rounded-full border ${positionStyles[result.market_position]?.pill ?? ""}`}>
              {positionStyles[result.market_position]?.label ?? result.market_position}
            </span>
          </div>

          {/* Key numbers */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Your cost", value: `£${result.wholesale.recommended.toFixed(2)}`, sub: `£${result.wholesale.floor.toFixed(2)} – £${result.wholesale.ceiling.toFixed(2)}`, color: "text-[#1d1d1f]" },
              { label: "Suggested RRP", value: `£${result.suggested_rrp.recommended.toFixed(2)}`, sub: `£${result.suggested_rrp.low.toFixed(2)} – £${result.suggested_rrp.high.toFixed(2)}`, color: "text-[#0071e3]" },
              { label: "Your margin", value: result.client_margin, sub: "D2C retail", color: "text-green-600" },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl bg-[#f5f5f7] p-4">
                <p className="text-[10px] font-medium text-[#86868b] uppercase tracking-wide mb-1">{item.label}</p>
                <p className={`text-xl font-semibold ${item.color}`}>{item.value}</p>
                <p className="text-[10px] text-[#86868b] mt-0.5">{item.sub}</p>
              </div>
            ))}
          </div>

          {/* Market range */}
          {result.market_rrp_range && (
            <div className="rounded-2xl border border-[#d2d2d7] p-4">
              <p className="text-xs font-medium text-[#86868b] uppercase tracking-wide mb-3">UK Market RRP — {result.format}</p>
              <div className="grid grid-cols-3 gap-2 text-sm">
                {[
                  { tier: "Budget", val: result.market_rrp_range.budget },
                  { tier: "Mid", val: result.market_rrp_range.mid },
                  { tier: "Premium", val: result.market_rrp_range.premium },
                ].map(({ tier, val }) => (
                  <div key={tier}>
                    <p className="text-[10px] text-[#86868b] uppercase tracking-wide">{tier}</p>
                    <p className="text-sm font-medium text-[#1d1d1f]">{val}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Order total */}
          <div className="rounded-2xl bg-[#1d1d1f] px-6 py-5 flex items-center justify-between">
            <div>
              <p className="text-white/50 text-xs uppercase tracking-widest mb-0.5">Est. order total</p>
              <p className="text-white text-2xl font-semibold">
                £{result.estimated_order_total.toLocaleString("en-GB", { minimumFractionDigits: 2 })}
              </p>
              <p className="text-white/40 text-xs mt-0.5">
                {result.order_quantity.toLocaleString()} units × £{result.wholesale.recommended.toFixed(2)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-white/50 text-xs leading-relaxed max-w-[140px]">{result.volume_note}</p>
            </div>
          </div>

          {/* Disclaimer */}
          <p className="text-[11px] text-[#86868b] leading-relaxed">
            Estimate based on average ingredient costs. Exact pricing depends on your formulation. Submit an enquiry for a precise quote.
          </p>
        </div>
      )}
    </div>
  );
}
