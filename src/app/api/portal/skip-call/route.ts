/**
 * POST /api/portal/skip-call
 *
 * Moves the client's deal stage from "New Enquiry" or "Discovery Call Booked"
 * directly to "Initial Brief" — skipping the discovery call.
 * Requires Authorization: Bearer <session_token> header.
 */

import { NextRequest, NextResponse } from "next/server";
import { verifySessionJWT } from "@/lib/magic-link";
import { crmSearch, crmPut } from "@/lib/zoho";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const session = await verifySessionJWT(authHeader.slice(7));
    if (!session) {
      return NextResponse.json({ error: "Session expired" }, { status: 401 });
    }

    const { dealId } = await req.json();
    if (!dealId) {
      return NextResponse.json({ error: "dealId required" }, { status: 400 });
    }

    // Verify this deal belongs to the authenticated contact
    const dealSearch = await crmSearch(
      "Deals",
      `(Contact_Name.id:equals:${session.contactId})`,
      "id,Deal_Name,Stage"
    );
    const deal = dealSearch?.data?.find((d: any) => d.id === dealId);
    if (!deal) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Only allow skip from early stages
    const skipableStages = ["New Enquiry", "Discovery Call Booked"];
    if (!skipableStages.includes(deal.Stage)) {
      return NextResponse.json({
        error: "Deal is already past the discovery call stage",
      }, { status: 400 });
    }

    await crmPut(`Deals/${dealId}`, {
      data: [{ Stage: "Initial Brief" }],
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[skip-call] Error:", error?.message ?? error);
    return NextResponse.json({ error: "Failed to update deal" }, { status: 500 });
  }
}
