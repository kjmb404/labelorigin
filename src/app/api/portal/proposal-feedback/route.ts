/**
 * POST /api/portal/proposal-feedback
 *
 * Client sends a change request on their proposal.
 * Notifies the team on Slack with the message.
 */

import { NextRequest, NextResponse } from "next/server";
import { verifySessionJWT } from "@/lib/magic-link";
import { crmGet, slackPost } from "@/lib/zoho";

const SLACK_DEAL_UPDATES =
  "https://hooks.slack.com/services/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";

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

    const { dealId, message } = await req.json();
    if (!dealId || !message?.trim()) {
      return NextResponse.json({ error: "dealId and message required" }, { status: 400 });
    }

    // Fetch deal name for the Slack notification
    const dealRes = await crmGet(`Deals/${dealId}?fields=Deal_Name,Contact_Name`);
    const deal = dealRes?.data?.[0];

    // Verify deal belongs to this contact
    if (deal?.Contact_Name?.id !== session.contactId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await slackPost(SLACK_DEAL_UPDATES, {
      text: `💬 Proposal change request: ${deal?.Deal_Name}`,
      blocks: [
        {
          type: "header",
          text: { type: "plain_text", text: "💬 Client Requested Proposal Changes" },
        },
        { type: "divider" },
        {
          type: "section",
          fields: [
            { type: "mrkdwn", text: `*Deal:* ${deal?.Deal_Name || dealId}` },
            { type: "mrkdwn", text: `*From:* ${session.email}` },
          ],
        },
        {
          type: "section",
          text: { type: "mrkdwn", text: `*Message:*\n> ${message.trim()}` },
        },
        {
          type: "actions",
          elements: [
            {
              type: "button",
              text: { type: "plain_text", text: "View in Zoho CRM" },
              url: `https://crm.zoho.eu/crm/org${process.env.ZOHO_BOOKS_ORG_ID}/tab/Potentials/${dealId}`,
            },
          ],
        },
      ],
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[proposal-feedback] Error:", error?.message ?? error);
    return NextResponse.json({ error: "Failed to send feedback" }, { status: 500 });
  }
}
