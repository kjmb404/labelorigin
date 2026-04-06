/**
 * POST /api/cal/webhook
 *
 * Receives Cal.com booking events and updates the Zoho CRM deal stage.
 * On BOOKING_CREATED: moves the lead's deal from "New Enquiry" → "Discovery Call Booked".
 *
 * Set up in Cal.com: Settings → Developer → Webhooks → Add webhook
 * URL: https://medvi-clone.vercel.app/api/cal/webhook
 * Trigger: BOOKING_CREATED
 */

import { NextRequest, NextResponse } from "next/server";
import { crmSearch, crmPut } from "@/lib/zoho";
import { sendBookingConfirmedEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const triggerEvent = body?.triggerEvent;
    if (triggerEvent !== "BOOKING_CREATED") {
      // Acknowledge other events without acting
      return NextResponse.json({ received: true });
    }

    const attendees: { email?: string; name?: string }[] = body?.payload?.attendees ?? [];
    const attendee = attendees[0];
    const email = attendee?.email;
    const attendeeName = attendee?.name || "";
    const startTime: string = body?.payload?.startTime ?? "";

    if (!email) {
      console.error("[cal webhook] No attendee email in payload");
      return NextResponse.json({ error: "No attendee email" }, { status: 400 });
    }

    console.log(`[cal webhook] Booking created for ${email}`);

    // 1. Find contact by email
    const contactSearch = await crmSearch(
      "Contacts",
      `(Email:equals:${email})`,
      "id,Full_Name,Email"
    );

    if (!contactSearch?.data?.length) {
      console.warn(`[cal webhook] No CRM contact found for ${email}`);
      return NextResponse.json({ received: true, note: "Contact not found in CRM" });
    }

    const contactId = contactSearch.data[0].id;

    // 2. Find their most recent "New Enquiry" deal
    const dealSearch = await crmSearch(
      "Deals",
      `(Stage:equals:New Enquiry)`,
      "id,Deal_Name,Stage,Contact_Name,Created_Time"
    );

    if (!dealSearch?.data?.length) {
      console.warn(`[cal webhook] No "New Enquiry" deals found`);
      return NextResponse.json({ received: true, note: "No matching deal found" });
    }

    // Filter to deals belonging to this contact, pick the most recent
    const contactDeals = dealSearch.data.filter(
      (d: any) => d.Contact_Name?.id === contactId
    );

    if (!contactDeals.length) {
      console.warn(`[cal webhook] No "New Enquiry" deal for contact ${contactId}`);
      return NextResponse.json({ received: true, note: "No deal matched contact" });
    }

    // Sort by Created_Time desc, take the first
    contactDeals.sort(
      (a: any, b: any) =>
        new Date(b.Created_Time).getTime() - new Date(a.Created_Time).getTime()
    );
    const deal = contactDeals[0];

    // 3. Update deal stage
    const updateRes = await crmPut(`Deals/${deal.id}`, {
      data: [{ Stage: "Discovery Call Booked" }],
    });

    console.log(`[cal webhook] Deal ${deal.id} updated to "Discovery Call Booked"`, updateRes);

    // 4. Send booking confirmation + pre-call brief prompt
    await sendBookingConfirmedEmail(email, attendeeName, startTime);

    return NextResponse.json({ success: true, dealId: deal.id });
  } catch (error: any) {
    console.error("[cal webhook] Error:", error?.message ?? error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
