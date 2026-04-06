/**
 * POST /api/webhooks/proposal
 *
 * Receives a webhook from Zoho CRM when a deal's Stage changes to "Proposal Sent".
 * Fetches deal + contact, then sends a branded proposal notification email to the client.
 *
 * Zoho setup:
 *   Automation → Workflows → New Rule → Deals, Stage is changed to "Proposal Sent"
 *   Action: Webhook → POST https://[domain]/api/webhooks/proposal?secret=WEBHOOK_SECRET
 *   Parameters: id → ${Deals.id}  (or send full payload with ${Deals.*})
 */

import { NextRequest, NextResponse } from "next/server";
import { crmGet, crmSearch } from "@/lib/zoho";
import { sendProposalEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    // ── Verify secret ──────────────────────────────────────────────────────
    const secret = req.nextUrl.searchParams.get("secret");
    const expected = process.env.WEBHOOK_SECRET;
    if (expected && secret !== expected) {
      console.warn("[webhook/proposal] Invalid secret");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ── Parse deal ID ──────────────────────────────────────────────────────
    // Check URL query param first (most reliable with Zoho), then fall back to body
    let dealId: string | null = req.nextUrl.searchParams.get("id");

    if (!dealId) {
      const contentType = req.headers.get("content-type") || "";
      const rawText = await req.text();
      console.log("[webhook/proposal] content-type:", contentType, "body:", rawText);

      if (contentType.includes("application/json")) {
        const body = JSON.parse(rawText || "{}");
        dealId = body?.ids?.[0] ?? body?.id ?? body?.dealId ?? null;
      } else {
        const params = new URLSearchParams(rawText);
        dealId = params.get("id") ?? params.get("Id") ?? params.get("Deal_Id") ?? null;
      }
    }

    if (!dealId) {
      console.warn("[webhook/proposal] No deal ID found in URL or body");
      return NextResponse.json({ error: "No deal ID" }, { status: 400 });
    }

    console.log("[webhook/proposal] deal ID:", dealId);

    // ── Fetch deal from CRM ────────────────────────────────────────────────
    const dealRes = await crmGet(
      `Deals/${dealId}?fields=Deal_Name,Stage,Contact_Name,Quote_Total,Wholesale_Price_Per_Unit,Suggested_RRP,MOQ,Client_Margin_Pct,Product_Format`
    );
    const deal = dealRes?.data?.[0];
    if (!deal) {
      console.warn("[webhook/proposal] Deal not found:", dealId);
      return NextResponse.json({ error: "Deal not found" }, { status: 404 });
    }

    // Only fire for "Proposal Sent" (guard against spurious triggers)
    if (deal.Stage !== "Proposal Sent") {
      return NextResponse.json({ skipped: true, stage: deal.Stage });
    }

    // ── Fetch contact email ────────────────────────────────────────────────
    const contactId = deal.Contact_Name?.id;
    if (!contactId) {
      console.warn("[webhook/proposal] No contact on deal:", dealId);
      return NextResponse.json({ error: "No contact" }, { status: 400 });
    }

    const contactRes = await crmGet(`Contacts/${contactId}?fields=Email,Full_Name`);
    const contact = contactRes?.data?.[0];
    const toEmail = contact?.Email;
    const name = contact?.Full_Name || "";

    if (!toEmail) {
      console.warn("[webhook/proposal] No email for contact:", contactId);
      return NextResponse.json({ error: "No contact email" }, { status: 400 });
    }

    // ── Send proposal email ────────────────────────────────────────────────
    await sendProposalEmail(toEmail, name, {
      dealName: deal.Deal_Name,
      quoteTotal: deal.Quote_Total,
      wholesalePrice: deal.Wholesale_Price_Per_Unit,
      suggestedRrp: deal.Suggested_RRP,
      moq: deal.MOQ,
      clientMargin: deal.Client_Margin_Pct,
      productFormat: deal.Product_Format,
    });

    console.log(`[webhook/proposal] Email sent to ${toEmail} for deal ${deal.Deal_Name}`);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[webhook/proposal] Error:", error?.message ?? error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
