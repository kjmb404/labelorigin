/**
 * Magic Link Authentication
 *
 * Tokens are self-contained signed JWTs — no server-side store needed.
 * Works correctly across all Vercel serverless function instances.
 *
 * ENV VARS:
 *   MAGIC_LINK_SECRET  — signing secret (keep long & random)
 *   SITE_URL           — e.g. https://medvi-clone.vercel.app
 */

import crypto from "crypto";

const SECRET = () => process.env.MAGIC_LINK_SECRET!;
const TTL_MS = 15 * 60 * 1000; // 15 minutes

interface TokenPayload {
  email:     string;
  contactId: string;
  exp:       number; // ms timestamp
}

// ─── Pending token (magic link) ───────────────────────────────────────────────

/** Generate a signed token encoding email + contactId. No store required. */
export function generateToken(email: string, contactId: string): string {
  const payload = Buffer.from(
    JSON.stringify({ email, contactId, exp: Date.now() + TTL_MS } satisfies TokenPayload)
  ).toString("base64url");

  const sig = crypto
    .createHmac("sha256", SECRET())
    .update(payload)
    .digest("base64url");

  return `${payload}.${sig}`;
}

/** Verify a magic-link token. Returns payload or null if invalid/expired. */
export function validatePendingToken(token: string): { email: string; contactId: string } | null {
  const parts = token.split(".");
  if (parts.length !== 2) return null;

  const [payload, sig] = parts;

  const expectedSig = crypto
    .createHmac("sha256", SECRET())
    .update(payload)
    .digest("base64url");

  if (sig !== expectedSig) return null;

  let data: TokenPayload;
  try {
    data = JSON.parse(Buffer.from(payload, "base64url").toString());
  } catch {
    return null;
  }

  if (Date.now() > data.exp) return null;

  return { email: data.email, contactId: data.contactId };
}

// ─── Backwards-compat shim (unused in new flow but keeps imports clean) ───────
export function generateToken_legacy(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let t = "";
  for (let i = 0; i < 64; i++) t += chars.charAt(Math.floor(Math.random() * chars.length));
  return t;
}
export function storePendingToken(_t: string, _e: string, _c: string) { /* no-op */ }

// ─── Session JWT ──────────────────────────────────────────────────────────────

import { SignJWT, jwtVerify } from "jose";

const JOSE_SECRET = () => new TextEncoder().encode(SECRET());

export async function createSessionJWT(email: string, contactId: string): Promise<string> {
  return new SignJWT({ email, contactId })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .setIssuedAt()
    .sign(JOSE_SECRET());
}

export async function verifySessionJWT(token: string): Promise<{ email: string; contactId: string } | null> {
  try {
    const { payload } = await jwtVerify(token, JOSE_SECRET());
    return { email: payload.email as string, contactId: payload.contactId as string };
  } catch { return null; }
}
