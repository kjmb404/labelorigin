/**
 * POST /api/auth/magic-link
 *
 * Sends a magic link to the client's email.
 * Looks up the contact in Zoho CRM by email to verify they're a known client.
 * In development, returns the link directly so you can click it without email.
 */

import { NextRequest, NextResponse } from "next/server";
import { crmSearch } from "@/lib/zoho";
import { generateToken } from "@/lib/magic-link";
import { sendMagicLinkEmail } from "@/lib/email";

const isDev = process.env.NODE_ENV !== "production";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Look up in Zoho CRM — check Contacts first, then Leads
    const contactSearch = await crmSearch(
      "Contacts",
      `(Email:equals:${email})`,
      "id,Full_Name,Email,First_Name"
    );

    let record = contactSearch?.data?.[0] ?? null;

    if (!record) {
      const leadSearch = await crmSearch(
        "Leads",
        `(Email:equals:${email})`,
        "id,Full_Name,Email,First_Name,Last_Name"
      );
      record = leadSearch?.data?.[0] ?? null;
    }

    if (!record) {
      if (isDev) {
        return NextResponse.json({
          success: false,
          error: "[Dev] No Zoho CRM contact or lead found for this email. Add the record in CRM first, or use an email that exists.",
        });
      }
      return NextResponse.json({
        success: true,
        message: "If this email is registered, you'll receive a link shortly.",
      });
    }

    const contact     = record;
    const contactId   = contact.id;
    const contactName = contact.First_Name || contact.Full_Name || contact.Last_Name || "";

    // Generate self-contained signed token (no server-side store needed)
    const token = generateToken(email, contactId);
    const result = await sendMagicLinkEmail(email, contactName, token);

    return NextResponse.json({
      success: true,
      message: "Login link sent — check your inbox.",
      dev_link: result.magicLink,
    });
  } catch (error: any) {
    console.error("Magic link error:", error?.message ?? error, error?.stack ?? "");
    return NextResponse.json(
      { error: "Something went wrong. Please try again.", detail: error?.message },
      { status: 500 }
    );
  }
}
