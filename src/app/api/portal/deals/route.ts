/**
 * GET /api/portal/deals
 * 
 * Returns all deals for the authenticated client.
 * Requires Authorization: Bearer <session_token> header.
 */

import { NextRequest, NextResponse } from "next/server";
import { verifySessionJWT } from "@/lib/magic-link";
import { crmSearch, crmGet } from "@/lib/zoho";

// Stage progression for timeline display
const STAGE_ORDER = [
  "New Enquiry",
  "Discovery Call Booked",
  "Feasibility Review",
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

const STAGE_PERCENT: Record<string, number> = {
  "New Enquiry": 0,
  "Discovery Call Booked": 5,
  "Feasibility Review": 10,
  "Proposal Sent": 25,
  "Proposal Accepted": 35,
  "Sample Development": 45,
  "Sample Approved": 55,
  "Deposit Invoiced": 65,
  "In Production": 75,
  "Final Balance Invoiced": 85,
  "Shipped / Delivery": 90,
  "Closed / Completed": 100,
  "Lost / Declined": 0,
};

export async function GET(req: NextRequest) {
  try {
    // Auth check
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const session = await verifySessionJWT(authHeader.slice(7));
    if (!session) {
      return NextResponse.json({ error: "Session expired" }, { status: 401 });
    }

    // Fetch deals where Contact = this client's contact ID
    const dealsRes = await crmSearch(
      "Deals",
      `(Contact_Name.id:equals:${session.contactId})`,
      "Deal_Name,Stage,Product_Format,Quote_Total,Wholesale_Price_Per_Unit,Suggested_RRP,Market_Position,MOQ,Created_Time,Modified_Time,Closing_Date,Cost_Per_Unit,Client_Margin_Pct,Gummies_Per_Unit,Brief_Product_Name,Brief_Health_Benefit,Brief_Target_Consumer,Brief_Ingredients,Brief_Avoid,Brief_Certifications,Brief_Flavour,Brief_Sales_Channel,Brief_Has_Formula,Brief_Additional_Notes,Formula_Status,Packaging_Status,Sample_Ready,Tracking_Number,Delivery_Date,Production_Start_Date,Expected_Completion_Date,Deposit_Paid,Deposit_Amount,Units_Ordered,Deposit_Invoice_Ref,Final_Invoice_Ref"
    );

    if (!dealsRes?.data) {
      return NextResponse.json({ deals: [] });
    }

    const deals = dealsRes.data.map((deal: any) => {
      const stage = deal.Stage || "New Enquiry";
      const stageIndex = Math.max(0, STAGE_ORDER.indexOf(stage));

      return {
        id: deal.id,
        name: deal.Deal_Name,
        stage,
        stage_percent: STAGE_PERCENT[stage] || 0,
        stage_index: stageIndex,
        total_stages: STAGE_ORDER.length,
        product_format: deal.Product_Format,
        quote_total: deal.Quote_Total,
        wholesale_price: deal.Wholesale_Price_Per_Unit,
        suggested_rrp: deal.Suggested_RRP,
        market_position: deal.Market_Position,
        moq: deal.MOQ,
        units_per_product: deal.Gummies_Per_Unit,
        cost_per_unit: deal.Cost_Per_Unit,
        client_margin: deal.Client_Margin_Pct,
        created: deal.Created_Time,
        modified: deal.Modified_Time,
        closing_date: deal.Closing_Date,
        // Timeline: which stages are completed
        completed_stages: STAGE_ORDER.slice(0, stageIndex),
        current_stage: stage,
        upcoming_stages: STAGE_ORDER.slice(stageIndex + 1),
        brief_submitted: !!deal.Brief_Product_Name,
        brief_product_name: deal.Brief_Product_Name || null,
        brief_health_benefit: deal.Brief_Health_Benefit || null,
        brief_target_consumer: deal.Brief_Target_Consumer || null,
        brief_ingredients: deal.Brief_Ingredients || null,
        brief_avoid: deal.Brief_Avoid || null,
        brief_certifications: deal.Brief_Certifications || null,
        brief_flavour: deal.Brief_Flavour || null,
        brief_sales_channel: deal.Brief_Sales_Channel || null,
        brief_has_formula: deal.Brief_Has_Formula || null,
        brief_additional_notes: deal.Brief_Additional_Notes || null,
        // Production tracking
        formula_status: deal.Formula_Status || null,
        packaging_status: deal.Packaging_Status || null,
        sample_ready: deal.Sample_Ready || null,
        tracking_number: deal.Tracking_Number || null,
        delivery_date: deal.Delivery_Date || null,
        production_start: deal.Production_Start_Date || null,
        expected_completion: deal.Expected_Completion_Date || null,
        deposit_paid: deal.Deposit_Paid ?? null,
        deposit_amount: deal.Deposit_Amount || null,
        units_ordered: deal.Units_Ordered || null,
        // Invoice linking
        deposit_invoice_ref: deal.Deposit_Invoice_Ref || null,
        final_invoice_ref: deal.Final_Invoice_Ref || null,
      };
    });

    // Sort: active deals first (by stage progress desc), then completed
    deals.sort((a: any, b: any) => {
      if (a.stage === "Closed / Completed" && b.stage !== "Closed / Completed") return 1;
      if (b.stage === "Closed / Completed" && a.stage !== "Closed / Completed") return -1;
      return b.stage_percent - a.stage_percent;
    });

    return NextResponse.json({ deals });
  } catch (error: any) {
    console.error("Portal deals error:", error);
    return NextResponse.json(
      { error: "Failed to fetch deals" },
      { status: 500 }
    );
  }
}
