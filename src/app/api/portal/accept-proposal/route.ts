/**
 * POST /api/portal/accept-proposal
 * 
 * Allows an authenticated client to accept a proposal for their deal.
 * Updates the deal stage to "Proposal Accepted" and triggers downstream automation.
 */

import { NextRequest, NextResponse } from "next/server";
import { verifySessionJWT } from "@/lib/magic-link";
import { crmGet, crmPut, slackPost } from "@/lib/zoho";

const SLACK_DEAL_UPDATES = "https://hooks.slack.com/services/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";

export async function POST(req: NextRequest) {
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

    const { dealId } = await req.json();
    if (!dealId) {
      return NextResponse.json(
        { error: "Deal ID is required" },
        { status: 400 }
      );
    }

    // Verify this deal belongs to this client
    const dealRes = await crmGet(`Deals/${dealId}`, {
      fields: "Deal_Name,Stage,Contact_Name,Quote_Total",
    });

    if (!dealRes?.data?.[0]) {
      return NextResponse.json({ error: "Deal not found" }, { status: 404 });
    }

    const deal = dealRes.data[0];
    const dealContactId = deal.Contact_Name?.id;

    if (dealContactId !== session.contactId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Check deal is in the right stage
    if (deal.Stage !== "Proposal Sent") {
      return NextResponse.json(
        { error: `Cannot accept — deal is currently at "${deal.Stage}"` },
        { status: 400 }
      );
    }

    // Update deal stage to Proposal Accepted
    const updateRes = await crmPut(`Deals/${dealId}`, {
      data: [{ Stage: "Proposal Accepted" }],
    });

    if (!updateRes?.data?.[0]?.details?.id) {
      return NextResponse.json(
        { error: "Failed to update deal" },
        { status: 500 }
      );
    }

    // Post to Slack
    await slackPost(SLACK_DEAL_UPDATES, {
      text: `✅ Proposal accepted via portal: ${deal.Deal_Name}`,
      blocks: [
        {
          type: "header",
          text: { type: "plain_text", text: "✅ Proposal Accepted via Portal" },
        },
        { type: "divider" },
        {
          type: "section",
          fields: [
            { type: "mrkdwn", text: `*Deal:* ${deal.Deal_Name}` },
            { type: "mrkdwn", text: `*Client:* ${session.email}` },
            { type: "mrkdwn", text: `*Value:* GBP ${deal.Quote_Total || "TBC"}` },
          ],
        },
      ],
    });

    return NextResponse.json({
      success: true,
      message: "Proposal accepted. We'll be in touch with next steps.",
    });
  } catch (error: any) {
    console.error("Accept proposal error:", error);
    return NextResponse.json(
      { error: "Failed to accept proposal. Please try again." },
      { status: 500 }
    );
  }
}
