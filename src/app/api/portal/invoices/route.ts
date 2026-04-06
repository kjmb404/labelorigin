/**
 * GET /api/portal/invoices
 *
 * Returns all invoices for the authenticated client from Zoho Books.
 * Matches invoices by:
 *   1. Reference number containing the CRM deal ID (auto-created invoices, e.g. "DEP50-{dealId}")
 *   2. Customer email (manually created invoices)
 *
 * Requires Authorization: Bearer <session_token> header.
 */

import { NextRequest, NextResponse } from "next/server";
import { verifySessionJWT } from "@/lib/magic-link";
import { crmGet, crmSearch, booksGet } from "@/lib/zoho";

function mapInvoice(inv: any, invoice_url?: string) {
  // Detect invoice type from reference prefix
  const ref: string = inv.reference_number || "";
  let deal_id: string | null = null;
  let invoice_type: string | null = null;

  const depMatch = ref.match(/^DEP50-(.+)$/);
  const finMatch = ref.match(/^(?:FIN|BAL|FINAL)-(.+)$/i);
  if (depMatch)      { deal_id = depMatch[1]; invoice_type = "Deposit (50%)"; }
  else if (finMatch) { deal_id = finMatch[1]; invoice_type = "Final balance";  }

  return {
    id: inv.invoice_id,
    number: inv.invoice_number,
    date: inv.date,
    due_date: inv.due_date,
    status: inv.status,
    total: inv.total,
    balance: inv.balance,
    currency: inv.currency_code,
    reference: ref,
    deal_id,
    invoice_type,
    invoice_url: invoice_url || null,
  };
}

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

    // Get contact email
    const contactRes = await crmGet(`Contacts/${session.contactId}`, {
      fields: "Email,Full_Name",
    });
    const contact = contactRes?.data?.[0];
    const email = contact?.Email || session.email;

    // Get all deals for this contact to match by deal ID reference
    const dealsRes = await crmSearch(
      "Deals",
      `(Contact_Name.id:equals:${session.contactId})`,
      "Deal_Name"
    );
    const dealIds: string[] = (dealsRes?.data || []).map((d: any) => d.id as string);

    // Fetch invoices via two strategies in parallel
    const fetches: Promise<any>[] = [
      // Strategy 1: by email (manually created invoices)
      email
        ? booksGet("invoices", { email, sort_column: "date", sort_order: "D" })
        : Promise.resolve(null),
    ];

    // Strategy 2: by deal ID reference (one Books search per deal)
    for (const dealId of dealIds) {
      fetches.push(
        booksGet("invoices", {
          reference_number_contains: dealId,
          sort_column: "date",
          sort_order: "D",
        })
      );
    }

    const results = await Promise.all(fetches);

    // Merge and deduplicate by invoice_id
    const seen = new Set<string>();
    const rawInvoices: any[] = [];

    for (const res of results) {
      for (const inv of res?.invoices ?? []) {
        if (!seen.has(inv.invoice_id)) {
          seen.add(inv.invoice_id);
          rawInvoices.push(inv);
        }
      }
    }

    // Fetch invoice_url for each invoice in parallel (it's only in the detail response)
    const invoices = await Promise.all(
      rawInvoices.map(async (inv) => {
        try {
          const detail = await booksGet(`invoices/${inv.invoice_id}`);
          return mapInvoice(inv, detail?.invoice?.invoice_url);
        } catch {
          return mapInvoice(inv);
        }
      })
    );

    // Sort newest first
    invoices.sort((a, b) => (b.date > a.date ? 1 : -1));

    return NextResponse.json({ invoices });
  } catch (error: any) {
    console.error("Portal invoices error:", error);
    return NextResponse.json({ error: "Failed to fetch invoices" }, { status: 500 });
  }
}
