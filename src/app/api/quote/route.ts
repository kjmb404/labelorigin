/**
 * POST /api/quote
 * 
 * Instant quote calculator — reads Market Benchmarks from Zoho CRM
 * and returns an estimated RRP range based on product format and specs.
 * 
 * This is a public-facing estimate (no auth required).
 * For exact pricing, clients submit an enquiry for a full CalcQuote.
 */

import { NextRequest, NextResponse } from "next/server";
import { crmSearch, crmGet } from "@/lib/zoho";

interface QuoteRequest {
  product_format: string;       // Gummies, Capsules, Powders, etc.
  units_per_product: number;    // e.g. 60 gummies per bottle
  num_ingredients: number;      // Number of active ingredients
  order_quantity: number;       // MOQ / order size
}

// Rough ingredient cost estimate per format (GBP per unit)
const AVG_INGREDIENT_COST: Record<string, number> = {
  Gummies: 0.025,
  Capsules: 0.008,
  Soft_Gels: 0.012,
  Powders: 0.005,     // per gram
  Tinctures: 0.006,   // per ml
  Ready_to_Drink: 0.004, // per ml
  Tablets: 0.006,
};

const FIXED_COST_PER_UNIT: Record<string, number> = {
  Gummies: 0.012,
  Capsules: 0.005,
  Soft_Gels: 0.008,
  Powders: 0.003,
  Tinctures: 0.004,
  Ready_to_Drink: 0.003,
  Tablets: 0.004,
};

const DEFAULT_PACKAGING = 0.50; // GBP per finished product

export async function POST(req: NextRequest) {
  try {
    const body: QuoteRequest = await req.json();

    if (!body.product_format || !body.units_per_product || !body.order_quantity) {
      return NextResponse.json(
        { error: "Product format, units per product, and order quantity are required" },
        { status: 400 }
      );
    }

    const format = body.product_format;
    const unitsPerProduct = body.units_per_product;
    const numIngredients = body.num_ingredients || 3;
    const orderQty = body.order_quantity;

    // 1. Fetch market benchmarks from Zoho
    let benchmarks = null;
    try {
      const bmSearch = await crmSearch(
        "Market_Benchmarks",
        `(Name:equals:${format})`,
        "Budget_Low,Budget_High,Mid_Low,Mid_High,Premium_Low,Premium_High,Unit_Label"
      );
      if (bmSearch?.data?.length > 0) {
        benchmarks = bmSearch.data[0];
      }
    } catch (e) {
      // Fallback to hardcoded if Zoho is unavailable
      console.warn("Could not fetch benchmarks from Zoho, using defaults");
    }

    // 2. Estimate manufacturing cost
    const ingredientCost = (AVG_INGREDIENT_COST[format] || 0.015) * numIngredients;
    const fixedCost = FIXED_COST_PER_UNIT[format] || 0.008;
    const costPerUnit = ingredientCost + fixedCost;
    const costPerProduct = costPerUnit * unitsPerProduct + DEFAULT_PACKAGING;

    // 3. Calculate wholesale tiers
    const ws60 = costPerProduct * 1.60;
    const ws80 = costPerProduct * 1.80;
    const ws100 = costPerProduct * 2.00;

    // 4. Calculate suggested RRP (client gets 60% D2C margin)
    const rrpLow = ws60 / 0.40;
    const rrpRecommended = ws80 / 0.40;
    const rrpHigh = ws100 / 0.40;

    // 5. Determine market position
    const rrpPerUnit = rrpRecommended / unitsPerProduct;
    let marketPosition = "Mid-Range";
    if (benchmarks) {
      const midHigh = parseFloat(benchmarks.Mid_High) || 0.25;
      const premHigh = parseFloat(benchmarks.Premium_High) || 0.40;
      const budgetHigh = parseFloat(benchmarks.Budget_High) || 0.15;

      if (rrpPerUnit <= budgetHigh) marketPosition = "Budget";
      else if (rrpPerUnit <= midHigh) marketPosition = "Mid-Range";
      else if (rrpPerUnit <= premHigh) marketPosition = "Premium";
      else marketPosition = "Above Market";
    }

    // 6. Market RRP ranges (from benchmarks or defaults)
    const marketRange = benchmarks
      ? {
          budget: `£${(parseFloat(benchmarks.Budget_Low) * unitsPerProduct).toFixed(2)} - £${(parseFloat(benchmarks.Budget_High) * unitsPerProduct).toFixed(2)}`,
          mid: `£${(parseFloat(benchmarks.Mid_Low) * unitsPerProduct).toFixed(2)} - £${(parseFloat(benchmarks.Mid_High) * unitsPerProduct).toFixed(2)}`,
          premium: `£${(parseFloat(benchmarks.Premium_Low) * unitsPerProduct).toFixed(2)} - £${(parseFloat(benchmarks.Premium_High) * unitsPerProduct).toFixed(2)}`,
        }
      : null;

    // 7. Volume discount hint
    let volumeNote = "";
    if (orderQty >= 5000) volumeNote = "Volume pricing available — significant savings at this quantity.";
    else if (orderQty >= 2000) volumeNote = "Good volume — expect competitive per-unit pricing.";
    else if (orderQty >= 1000) volumeNote = "Standard order — room for volume discounts at 2000+.";
    else volumeNote = "Starter quantity — ideal for market testing.";

    // 8. Order total estimate
    const orderTotal = ws80 * orderQty;

    return NextResponse.json({
      success: true,
      estimate: {
        format,
        units_per_product: unitsPerProduct,
        num_ingredients: numIngredients,
        order_quantity: orderQty,
        // Cost
        estimated_cost_per_product: round(costPerProduct),
        // Wholesale tiers (what the client pays Label Origin)
        wholesale: {
          floor: round(ws60),
          recommended: round(ws80),
          ceiling: round(ws100),
        },
        // Suggested RRP (what their customer pays)
        suggested_rrp: {
          low: round(rrpLow),
          recommended: round(rrpRecommended),
          high: round(rrpHigh),
        },
        client_margin: "60%",
        market_position: marketPosition,
        market_rrp_range: marketRange,
        estimated_order_total: round(orderTotal),
        volume_note: volumeNote,
      },
      disclaimer:
        "This is an estimate based on average ingredient costs. Exact pricing depends on your specific formulation. Submit an enquiry for a precise quote.",
    });
  } catch (error: any) {
    console.error("Quote error:", error);
    return NextResponse.json(
      { error: "Could not calculate quote. Please try again." },
      { status: 500 }
    );
  }
}

function round(n: number): number {
  return Math.round(n * 100) / 100;
}
