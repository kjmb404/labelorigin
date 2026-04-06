/**
 * GET /api/portal/invoices
 * 
 * Returns all invoices for the authenticated client from Zoho Books.
 * Requires Authorization: Bearer <session_token> header.
 */

import { NextRequest, NextResponse } from "next/server";
import { verifySessionJWT } from "@/lib/magic-link";
import { crmGet, booksGet } from "@/lib/zoho";

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

    // Get contact details to find their name for Books search
    const contactRes = await crmGet(`Contacts/${session.contactId}`, {
      fields: "Full_Name,Email,Account_Name",
    });

    if (!contactRes?.data?.[0]) {
      return NextResponse.json({ invoices: [] });
    }

    const contact = contactRes.data[0];
    const email = contact.Email || session.email;

    // Search Zoho Books for invoices by customer email
    const invoicesRes = await booksGet("invoices", {
      email: email,
      sort_column: "date",
      sort_order: "D",
    });

    if (!invoicesRes?.invoices) {
      return NextResponse.json({ invoices: [] });
    }

    const invoices = invoicesRes.invoices.map((inv: any) => ({
      id: inv.invoice_id,
      number: inv.invoice_number,
      date: inv.date,
      due_date: inv.due_date,
      status: inv.status, // draft, sent, overdue, paid, void, partially_paid
      total: inv.total,
      balance: inv.balance,
      currency: inv.currency_code,
      reference: inv.reference_number,
      // Payment URL (if Zoho Books payment links are enabled)
      payment_url: inv.payment_expected_date ? null : null, // Add if you have online payment
    }));

    return NextResponse.json({ invoices });
  } catch (error: any) {
    console.error("Portal invoices error:", error);
    return NextResponse.json(
      { error: "Failed to fetch invoices" },
      { status: 500 }
    );
  }
}
