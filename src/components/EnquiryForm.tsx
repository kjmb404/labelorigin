/**
 * Enquiry Form Component
 * 
 * Drop this into your page:
 *   import { EnquiryForm } from "@/components/EnquiryForm";
 *   <EnquiryForm />
 */

"use client";

import { useState } from "react";

const FORMATS = [
  "Gummies",
  "Capsules",
  "Soft Gels",
  "Powders",
  "Tinctures",
  "Ready to Drink",
  "Tablets",
];

const BUDGET_RANGES = ["Budget", "Mid-Range", "Premium", "Not sure yet"];
const MARKETS = ["UK", "EU", "US", "Global", "Other"];

interface EnquiryFormProps {
  onSuccess?: (data: any) => void;
  className?: string;
}

export function EnquiryForm({ onSuccess, className = "" }: EnquiryFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    product_format: "",
    product_description: "",
    target_market: "",
    estimated_quantity: "",
    budget_range: "",
    message: "",
  });

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          estimated_quantity: form.estimated_quantity
            ? parseInt(form.estimated_quantity)
            : undefined,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setSubmitted(true);
        onSuccess?.(data);
      } else {
        setError(data.error || "Something went wrong.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className={className}>
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold mb-2">Enquiry Received</h3>
          <p className="text-muted-foreground">
            We&apos;ll review your requirements and get back to you within 24 hours.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={className}>
      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4 text-sm">
          {error}
        </div>
      )}

      {/* Contact */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1">Name *</label>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            placeholder="Your full name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Email *</label>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            placeholder="you@company.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Company</label>
          <input
            type="text"
            value={form.company}
            onChange={(e) => update("company", e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            placeholder="Your brand name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Phone</label>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            placeholder="+44..."
          />
        </div>
      </div>

      {/* Product */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1">Product Format *</label>
          <select
            required
            value={form.product_format}
            onChange={(e) => update("product_format", e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
          >
            <option value="">Select format...</option>
            {FORMATS.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Target Market</label>
          <select
            value={form.target_market}
            onChange={(e) => update("target_market", e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
          >
            <option value="">Select market...</option>
            {MARKETS.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Estimated Quantity</label>
          <input
            type="number"
            min="100"
            value={form.estimated_quantity}
            onChange={(e) => update("estimated_quantity", e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            placeholder="e.g. 500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Budget Range</label>
          <select
            value={form.budget_range}
            onChange={(e) => update("budget_range", e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
          >
            <option value="">Select range...</option>
            {BUDGET_RANGES.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Description */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-1">
          Tell us about your product
        </label>
        <textarea
          value={form.product_description}
          onChange={(e) => update("product_description", e.target.value)}
          className="w-full px-3 py-2 border rounded-md"
          rows={3}
          placeholder="What kind of supplement are you looking to create? Any specific ingredients or benefits?"
        />
      </div>

      {/* Message */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-1">
          Additional Notes
        </label>
        <textarea
          value={form.message}
          onChange={(e) => update("message", e.target.value)}
          className="w-full px-3 py-2 border rounded-md"
          rows={2}
          placeholder="Anything else we should know?"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full md:w-auto px-8 py-3 bg-[#01696F] text-white rounded-md font-medium hover:bg-[#0c4e54] transition-colors disabled:opacity-50"
      >
        {isSubmitting ? "Submitting..." : "Submit Enquiry"}
      </button>
    </form>
  );
}
