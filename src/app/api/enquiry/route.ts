/**
 * POST /api/enquiry
 *
 * Creates a Deal in Zoho CRM from a website enquiry form.
 * Also posts a notification to Slack #deal-updates.
 */

import { NextRequest, NextResponse } from "next/server";
import { crmPost, crmSearch, slackPost } from "@/lib/zoho";
import { sendEnquiryConfirmationEmail } from "@/lib/email";

const SLACK_DEAL_UPDATES =
  "https://hooks.slack.com/services/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";

interface EnquiryBody {
  // Contact info
  name: string;
  email: string;
  company?: string;
  phone?: string;
  // Product info
  product_format: string;       // Gummies, Capsules, Powders, etc.
  product_status?: string;      // New product / Existing product
  product_type?: string;        // Nootropics, Gut Health, Core Nutrition, etc.
  product_description?: string; // Free-text description / brief summary
  target_market?: string;       // UK, Europe, Outside the EU, All the Above
  estimated_quantity?: number;  // Units ordered
  timeline?: string;            // ASAP / 3 months / 6+ months
  launch_days?: number;         // Numeric days to launch (used to calc Target_Launch_Timing)
  // Quote numbers
  suggested_rrp?: number | null;
  wholesale_price?: number | null;
  market_position?: string | null;
  client_margin_pct?: number | null;
  quote_total?: number | null;
  cost_per_unit?: number | null;
  units_per_product?: number | null; // Servings / gummies per unit
  // Legacy
  budget_range?: string;
  message?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: EnquiryBody = await req.json();

    // Validate required fields
    if (!body.name || !body.email || !body.product_format) {
      return NextResponse.json(
        { error: "Name, email, and product format are required" },
        { status: 400 }
      );
    }

    // 1. Find or create Contact
    let contactId: string | null = null;
    const contactSearch = await crmSearch(
      "Contacts",
      `(Email:equals:${body.email})`,
      "id,Full_Name,Email"
    );

    if (contactSearch?.data?.length > 0) {
      contactId = contactSearch.data[0].id;
    } else {
      const nameParts = body.name.trim().split(" ");
      const lastName =
        nameParts.length > 1 ? nameParts.slice(1).join(" ") : nameParts[0];
      const firstName = nameParts.length > 1 ? nameParts[0] : "";

      const contactRes = await crmPost("Contacts", {
        data: [
          {
            First_Name: firstName,
            Last_Name: lastName,
            Email: body.email,
            Phone: body.phone || null,
            Lead_Source: "Web Download",
          },
        ],
      });
      contactId = contactRes?.data?.[0]?.details?.id || null;
    }

    // 2. Find or create Account (company)
    let accountId: string | null = null;
    if (body.company) {
      const acctSearch = await crmSearch(
        "Accounts",
        `(Account_Name:equals:${body.company})`,
        "id,Account_Name"
      );
      if (acctSearch?.data?.length > 0) {
        accountId = acctSearch.data[0].id;
      } else {
        const acctRes = await crmPost("Accounts", {
          data: [{ Account_Name: body.company }],
        });
        accountId = acctRes?.data?.[0]?.details?.id || null;
      }
    }

    // 3. Calculate Target Launch Timing date
    const launchDays = body.launch_days ?? 90;
    const targetLaunchDate = new Date(Date.now() + launchDays * 86_400_000)
      .toISOString()
      .split("T")[0];

    // Closing date = 30 days from now (standard pipeline estimate)
    const closingDate = new Date(Date.now() + 30 * 86_400_000)
      .toISOString()
      .split("T")[0];

    // 4. Build Deal payload — map every available field
    const dealData: Record<string, any> = {
      Deal_Name: body.company
        ? `${body.company} – ${body.product_format}`
        : `${body.name} – ${body.product_format}`,
      Stage: "New Enquiry",
      Lead_Source: "Web Download",
      Closing_Date: closingDate,

      // Product details
      Product_Format: body.product_format,
      ...(body.product_type ? { Product_Type: body.product_type } : {}),
      ...(body.target_market ? { Target_Market: body.target_market } : {}),
      ...(body.timeline ? { Timeline: body.timeline } : {}),
      Target_Launch_Timing: targetLaunchDate,

      // Quantity
      ...(body.estimated_quantity
        ? {
            Units_Ordered: body.estimated_quantity,
            MOQ: body.estimated_quantity,
          }
        : {}),
      ...(body.units_per_product
        ? { Gummies_Per_Unit: body.units_per_product }
        : {}),

      // Quote financials
      ...(body.cost_per_unit != null
        ? { Cost_Per_Unit: body.cost_per_unit }
        : {}),
      ...(body.wholesale_price != null
        ? { Wholesale_Price_Per_Unit: body.wholesale_price }
        : {}),
      ...(body.suggested_rrp != null
        ? { Suggested_RRP: body.suggested_rrp }
        : {}),
      ...(body.quote_total != null ? { Quote_Total: body.quote_total } : {}),
      ...(body.client_margin_pct != null
        ? { Client_Margin_Pct: body.client_margin_pct }
        : {}),
      ...(body.market_position ? { Market_Position: body.market_position } : {}),

      // Free-text brief summary
      Description: [
        body.product_status ? `Product status: ${body.product_status}` : "",
        body.product_description || "",
        body.message ? `Message: ${body.message}` : "",
        body.budget_range ? `Budget range: ${body.budget_range}` : "",
      ]
        .filter(Boolean)
        .join("\n"),
    };

    if (contactId) dealData.Contact_Name = contactId;
    if (accountId) dealData.Account_Name = accountId;

    const dealRes = await crmPost("Deals", { data: [dealData] });
    const dealId = dealRes?.data?.[0]?.details?.id;

    if (!dealId) {
      return NextResponse.json(
        { error: "Failed to create deal", details: dealRes },
        { status: 500 }
      );
    }

    // 5. Slack notification
    const formatCurrency = (v: number | null | undefined) =>
      v != null ? `£${v.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "N/A";

    await slackPost(SLACK_DEAL_UPDATES, {
      text: `🌐 New website enquiry: ${dealData.Deal_Name}`,
      blocks: [
        {
          type: "header",
          text: { type: "plain_text", text: "🌐 New Website Enquiry" },
        },
        { type: "divider" },
        {
          type: "section",
          fields: [
            { type: "mrkdwn", text: `*Name:* ${body.name}` },
            { type: "mrkdwn", text: `*Email:* ${body.email}` },
            { type: "mrkdwn", text: `*Company:* ${body.company || "N/A"}` },
            { type: "mrkdwn", text: `*Phone:* ${body.phone || "N/A"}` },
          ],
        },
        {
          type: "section",
          fields: [
            { type: "mrkdwn", text: `*Format:* ${body.product_format}` },
            { type: "mrkdwn", text: `*Product status:* ${body.product_status || "N/A"}` },
            { type: "mrkdwn", text: `*Product Type:* ${body.product_type || "N/A"}` },
            { type: "mrkdwn", text: `*Target Market:* ${body.target_market || "N/A"}` },
            { type: "mrkdwn", text: `*Timeline:* ${body.timeline || "N/A"}` },
          ],
        },
        {
          type: "section",
          fields: [
            { type: "mrkdwn", text: `*Units Ordered:* ${body.estimated_quantity?.toLocaleString() || "N/A"}` },
            { type: "mrkdwn", text: `*Cost/Unit:* ${formatCurrency(body.cost_per_unit)}` },
            { type: "mrkdwn", text: `*Wholesale Price:* ${formatCurrency(body.wholesale_price)}` },
            { type: "mrkdwn", text: `*Suggested RRP:* ${formatCurrency(body.suggested_rrp)}` },
          ],
        },
        {
          type: "section",
          fields: [
            { type: "mrkdwn", text: `*Quote Total:* ${formatCurrency(body.quote_total)}` },
            { type: "mrkdwn", text: `*Margin:* ${body.client_margin_pct != null ? `${body.client_margin_pct}%` : "N/A"}` },
            { type: "mrkdwn", text: `*Market Position:* ${body.market_position || "N/A"}` },
            { type: "mrkdwn", text: `*Target Launch:* ${targetLaunchDate}` },
          ],
        },
        ...(body.product_description
          ? [
              {
                type: "section" as const,
                text: {
                  type: "mrkdwn" as const,
                  text: `*Brief:*\n${body.product_description}`,
                },
              },
            ]
          : []),
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

    // 6. Confirmation email to lead
    await sendEnquiryConfirmationEmail(body.email, body.name, body.product_format);

    return NextResponse.json({
      success: true,
      dealId,
      message: "Enquiry received — we'll be in touch within 24 hours.",
    });
  } catch (error: any) {
    console.error("Enquiry error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
