/**
 * POST /api/webhooks/final-invoiced
 *
 * Receives a webhook from Zoho CRM when a deal's Stage changes to "Final Balance Invoiced".
 * Finds the matching final invoice in Zoho Books (reference: FIN-{dealId} / BAL-{dealId} / FINAL-{dealId}),
 * then sends a branded invoice notification email to the client.
 *
 * Zoho setup:
 *   Automation → Workflows → New Rule → Deals, Stage is changed to "Final Balance Invoiced"
 *   Action: Webhook → POST https://[domain]/api/webhooks/final-invoiced?secret=WEBHOOK_SECRET
 *   Body type: Form-Data → Parameter: id → ${Deals.id}
 */

import { NextRequest, NextResponse } from "next/server";
import { crmGet, booksGet } from "@/lib/zoho";
import { sendFinalInvoiceEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    // ── Verify secret ──────────────────────────────────────────────────────
    const secret = req.nextUrl.searchParams.get("secret");
    const expected = process.env.WEBHOOK_SECRET;
    if (expected && secret !== expected) {
      console.warn("[webhook/final-invoiced] Invalid secret");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ── Parse deal ID ──────────────────────────────────────────────────────
    let dealId: string | null = req.nextUrl.searchParams.get("id");

    if (!dealId) {
      const contentType = req.headers.get("content-type") || "";
      const rawText = await req.text();
      if (contentType.includes("application/json")) {
        const body = JSON.parse(rawText || "{}");
        dealId = body?.ids?.[0] ?? body?.id ?? null;
      } else {
        const params = new URLSearchParams(rawText);
        dealId = params.get("id") ?? params.get("Id") ?? params.get("Deal_Id") ?? null;
      }
    }

    if (!dealId) {
      console.warn("[webhook/final-invoiced] No deal ID found");
      return NextResponse.json({ error: "No deal ID" }, { status: 400 });
    }

    console.log("[webhook/final-invoiced] deal ID:", dealId);

    // ── Fetch deal from CRM ────────────────────────────────────────────────
    const dealRes = await crmGet(`Deals/${dealId}?fields=Deal_Name,Stage,Contact_Name`);
    const deal = dealRes?.data?.[0];
    if (!deal) {
      return NextResponse.json({ error: "Deal not found" }, { status: 404 });
    }

    if (deal.Stage !== "Final Balance Invoiced") {
      return NextResponse.json({ skipped: true, stage: deal.Stage });
    }

    // ── Fetch contact email ────────────────────────────────────────────────
    const contactId = deal.Contact_Name?.id;
    if (!contactId) {
      return NextResponse.json({ error: "No contact on deal" }, { status: 400 });
    }

    const contactRes = await crmGet(`Contacts/${contactId}?fields=Email,Full_Name`);
    const contact = contactRes?.data?.[0];
    const toEmail = contact?.Email;
    const name = contact?.Full_Name || "";

    if (!toEmail) {
      return NextResponse.json({ error: "No contact email" }, { status: 400 });
    }

    // ── Find final invoice in Books (reference: FIN-/BAL-/FINAL-{dealId}) ──
    const invoicesRes = await booksGet("invoices", {
      reference_number_contains: dealId,
    });

    const invoices: any[] = invoicesRes?.invoices || [];
    const finalInv = invoices.find((i: any) =>
      /^(?:FIN|BAL|FINAL)-/i.test(i.reference_number || "")
    );

    if (!finalInv) {
      console.warn("[webhook/final-invoiced] No final invoice found for deal:", dealId);
      return NextResponse.json({ error: "No final invoice found" }, { status: 404 });
    }

    // Fetch invoice URL from detail
    let invoiceUrl: string | null = null;
    try {
      const detail = await booksGet(`invoices/${finalInv.invoice_id}`);
      invoiceUrl = detail?.invoice?.invoice_url || null;
    } catch {}

    // ── Send email ─────────────────────────────────────────────────────────
    await sendFinalInvoiceEmail(toEmail, name, {
      dealName:      deal.Deal_Name,
      invoiceNumber: finalInv.invoice_number,
      invoiceTotal:  finalInv.total,
      dueDate:       finalInv.due_date,
      currency:      finalInv.currency_code,
      invoiceUrl,
    });

    console.log(`[webhook/final-invoiced] Email sent to ${toEmail} for deal ${deal.Deal_Name}`);
    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("[webhook/final-invoiced] Error:", error?.message ?? error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
