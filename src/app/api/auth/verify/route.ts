/**
 * GET /api/auth/verify?token=xxx
 * 
 * Validates a magic link token and returns a session JWT.
 */

import { NextRequest, NextResponse } from "next/server";
import { validatePendingToken, createSessionJWT } from "@/lib/magic-link";

export async function GET(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { error: "Token is required" },
        { status: 400 }
      );
    }

    // Validate the magic link token
    const result = validatePendingToken(token);

    if (!result) {
      return NextResponse.json(
        { error: "Invalid or expired link. Please request a new one." },
        { status: 401 }
      );
    }

    // Create a session JWT (valid for 7 days)
    const sessionToken = await createSessionJWT(result.email, result.contactId);

    return NextResponse.json({
      success: true,
      session_token: sessionToken,
      email: result.email,
    });
  } catch (error: any) {
    console.error("Verify error:", error);
    return NextResponse.json(
      { error: "Verification failed. Please try again." },
      { status: 500 }
    );
  }
}
