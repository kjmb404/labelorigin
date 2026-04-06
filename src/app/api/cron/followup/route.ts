/**
 * GET /api/cron/followup
 *
 * Vercel Cron Job — runs every hour.
 * Finds leads in "New Enquiry" stage created 23.5–24.5 hours ago
 * and sends them a follow-up email with the booking link.
 *
 * Because the window is exactly 1 hour wide and the cron runs hourly,
 * each deal is caught exactly once — no duplicate emails, no database needed.
 */

import { NextRequest, NextResponse } from "next/server";
import { crmSearch } from "@/lib/zoho";
import { sendFollowUpEmail } from "@/lib/email";

const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(req: NextRequest) {
  // Protect the endpoint so only Vercel's cron runner can call it
  const auth = req.headers.get("authorization");
  if (CRON_SECRET && auth !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Cron runs daily at 9am UTC.
  // Window: deals created between 23h and 47h ago.
  // This ensures every deal is caught by exactly one daily run,
  // regardless of what time of day the enquiry came in.
  const now = Date.now();
  const windowStart = new Date(now - 47 * 60 * 60 * 1000).toISOString(); // 47h ago
  const windowEnd   = new Date(now - 23 * 60 * 60 * 1000).toISOString(); // 23h ago

  console.log(`[followup cron] Checking for deals created between ${windowStart} and ${windowEnd}`);

  // Fetch all "New Enquiry" deals (still not booked = still in this stage)
  const dealSearch = await crmSearch(
    "Deals",
    `(Stage:equals:New Enquiry)`,
    "id,Deal_Name,Stage,Contact_Name,Created_Time"
  );

  if (!dealSearch?.data?.length) {
    console.log("[followup cron] No New Enquiry deals found");
    return NextResponse.json({ sent: 0 });
  }

  // Filter to the 23h–47h window
  const dueDeals = dealSearch.data.filter((d: any) => {
    const created = new Date(d.Created_Time).getTime();
    return created >= new Date(windowStart).getTime() && created <= new Date(windowEnd).getTime();
  });

  console.log(`[followup cron] ${dueDeals.length} deal(s) due for follow-up`);

  let sent = 0;
  for (const deal of dueDeals) {
    const contactId = deal.Contact_Name?.id;
    if (!contactId) continue;

    // Fetch contact details to get email + name
    const contactSearch = await crmSearch(
      "Contacts",
      `(id:equals:${contactId})`,
      "id,Full_Name,Email,First_Name"
    );

    const contact = contactSearch?.data?.[0];
    if (!contact?.Email) continue;

    const result = await sendFollowUpEmail(contact.Email, contact.First_Name || contact.Full_Name);
    if (result.success) {
      sent++;
      console.log(`[followup cron] Sent follow-up to ${contact.Email} (deal: ${deal.Deal_Name})`);
    }
  }

  return NextResponse.json({ sent, checked: dueDeals.length });
}
