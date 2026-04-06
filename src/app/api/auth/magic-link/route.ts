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

    // Look up contact in Zoho CRM
    const contactSearch = await crmSearch(
      "Contacts",
      `(Email:equals:${email})`,
      "id,Full_Name,Email,First_Name"
    );

    if (!contactSearch?.data?.length) {
      // Security: don't reveal whether the email exists
      // In dev, hint that the email isn't in CRM so it's easier to debug
      if (isDev) {
        return NextResponse.json({
          success: false,
          error: "[Dev] No Zoho CRM contact found for this email. Add the contact in CRM first, or use an email that exists.",
        });
      }
      return NextResponse.json({
        success: true,
        message: "If this email is registered, you'll receive a link shortly.",
      });
    }

    const contact    = contactSearch.data[0];
    const contactId  = contact.id;
    const contactName = contact.First_Name || contact.Full_Name || "";

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
