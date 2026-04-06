/**
 * POST /api/portal/checklist
 *
 * Saves the client's pre-call checklist as a Note on their Zoho CRM deal.
 * Requires Authorization: Bearer <session_token> header.
 */

import { NextRequest, NextResponse } from "next/server";
import { verifySessionJWT } from "@/lib/magic-link";
import { crmGet, crmPost, crmPut, crmSearch, slackPost } from "@/lib/zoho";

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

    const body = await req.json();
    const { dealId, answers } = body;

    if (!dealId || !answers) {
      return NextResponse.json({ error: "dealId and answers required" }, { status: 400 });
    }

    // Verify this deal belongs to the authenticated contact and get current stage
    const dealSearch = await crmSearch(
      "Deals",
      `(Contact_Name.id:equals:${session.contactId})`,
      "id,Deal_Name,Stage"
    );
    const ownedDeal = dealSearch?.data?.find((d: any) => d.id === dealId);
    if (!ownedDeal) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const currentStage: string = ownedDeal.Stage || "New Enquiry";

    // Format checklist as a readable note
    const lines = [
      "── PRE-CALL BRIEF ──────────────────────────────",
      "",
      `Product name: ${answers.product_name || "Not provided"}`,
      `Primary health benefit: ${answers.health_benefit || "Not provided"}`,
      `Target consumer: ${answers.target_consumer || "Not provided"}`,
      "",
      `Existing formula: ${answers.existing_formula || "Not provided"}`,
      `Key ingredients wanted: ${answers.ingredients_wanted || "Not provided"}`,
      `Ingredients to avoid: ${answers.ingredients_avoid || "Not provided"}`,
      `Certifications needed: ${(answers.certifications || []).join(", ") || "None specified"}`,
      `Flavour preference: ${answers.flavour || "Not specified"}`,
      "",
      `Primary sales channel: ${answers.sales_channel || "Not provided"}`,
      `Label compliance support needed: ${answers.label_compliance || "Not sure"}`,
      "",
      `Reference / competitor products: ${answers.references || "Not provided"}`,
      `Additional notes: ${answers.additional_notes || "None"}`,
      "",
      `Submitted: ${new Date().toISOString()}`,
    ];

    const noteContent = lines.join("\n");

    // 1. Update Project_Notes + all dedicated custom fields on the deal record
    // If submitted at Feasibility Review, auto-advance to Proposal Sent
    const advanceStage = currentStage === "Feasibility Review";

    await crmPut(`Deals/${dealId}`, {
      data: [
        {
          Project_Notes: noteContent,
          ...(advanceStage ? { Stage: "Proposal Sent" } : {}),
          Brief_Product_Name: answers.product_name || null,
          Brief_Health_Benefit: answers.health_benefit || null,
          Brief_Target_Consumer: answers.target_consumer || null,
          Brief_Has_Formula: answers.existing_formula || null,
          Brief_Ingredients: answers.ingredients_wanted || null,
          Brief_Avoid: answers.ingredients_avoid || null,
          Brief_Certifications: answers.certifications?.length
            ? answers.certifications
            : null,
          Brief_Flavour: answers.flavour || null,
          Brief_Sales_Channel: answers.sales_channel || null,
          Brief_Label_Compliance: answers.label_compliance || null,
          Brief_References: answers.references || null,
          Brief_Additional_Notes: answers.additional_notes || null,
        },
      ],
    });

    // 2. Also create a Note for visibility in the activity feed
    const noteRes = await crmPost("Notes", {
      data: [
        {
          Note_Title: "Pre-Call Brief",
          Note_Content: noteContent,
          Parent_Id: dealId,
          se_module: "Deals",
        },
      ],
    });
    console.log("[checklist] Note result:", JSON.stringify(noteRes));

    // 3. Slack notification — brief received (+ stage advance alert if applicable)
    await slackPost(SLACK_DEAL_UPDATES, {
      text: `📋 Pre-call brief submitted: ${ownedDeal.Deal_Name}`,
      blocks: [
        {
          type: "header",
          text: { type: "plain_text", text: "📋 Pre-Call Brief Submitted" },
        },
        { type: "divider" },
        {
          type: "section",
          fields: [
            { type: "mrkdwn", text: `*Deal:* ${ownedDeal.Deal_Name}` },
            { type: "mrkdwn", text: `*Was at stage:* ${currentStage}` },
            { type: "mrkdwn", text: `*Product:* ${answers.product_name || "Not provided"}` },
            { type: "mrkdwn", text: `*Health benefit:* ${answers.health_benefit || "Not provided"}` },
            { type: "mrkdwn", text: `*Sales channel:* ${answers.sales_channel || "Not provided"}` },
            { type: "mrkdwn", text: `*Formula status:* ${answers.existing_formula || "Not provided"}` },
          ],
        },
        ...(advanceStage ? [{
          type: "section" as const,
          text: { type: "mrkdwn" as const, text: "✅ *Deal automatically advanced to Proposal Sent* — brief answers qualify. Review and send proposal." },
        }] : []),
        {
          type: "actions",
          elements: [
            {
              type: "button",
              text: { type: "plain_text", text: "View in Zoho CRM" },
              url: `https://crm.zoho.eu/crm/org${process.env.ZOHO_BOOKS_ORG_ID}/tab/Potentials/${dealId}`,
              style: "primary",
            },
          ],
        },
      ],
    });

    return NextResponse.json({ success: true, advanced: advanceStage });
  } catch (error: any) {
    console.error("[checklist] Error:", error?.message ?? error);
    return NextResponse.json({ error: "Failed to save checklist" }, { status: 500 });
  }
}
