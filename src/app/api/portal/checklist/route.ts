/**
 * POST /api/portal/checklist
 *
 * Saves the client's pre-call checklist as a Note on their Zoho CRM deal.
 * Requires Authorization: Bearer <session_token> header.
 */

import { NextRequest, NextResponse } from "next/server";
import { verifySessionJWT } from "@/lib/magic-link";
import { crmPost, crmPut, crmSearch } from "@/lib/zoho";

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

    // Verify this deal belongs to the authenticated contact
    const dealSearch = await crmSearch(
      "Deals",
      `(Contact_Name.id:equals:${session.contactId})`,
      "id,Deal_Name"
    );
    const ownsDeal = dealSearch?.data?.some((d: any) => d.id === dealId);
    if (!ownsDeal) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

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
    await crmPut(`Deals/${dealId}`, {
      data: [
        {
          Project_Notes: noteContent,
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

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[checklist] Error:", error?.message ?? error);
    return NextResponse.json({ error: "Failed to save checklist" }, { status: 500 });
  }
}
