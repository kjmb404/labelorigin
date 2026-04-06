/**
 * Zoho CRM & Books OAuth2 Client
 * Handles token refresh, API calls, and error handling.
 * 
 * ENV VARS REQUIRED:
 *   ZOHO_CLIENT_ID
 *   ZOHO_CLIENT_SECRET
 *   ZOHO_REFRESH_TOKEN
 *   ZOHO_BOOKS_ORG_ID   (for Books API calls)
 */

let cachedToken: { access_token: string; expires_at: number } | null = null;

async function getAccessToken(): Promise<string> {
  // Return cached token if still valid (with 60s buffer)
  if (cachedToken && Date.now() < cachedToken.expires_at - 60000) {
    return cachedToken.access_token;
  }

  const res = await fetch("https://accounts.zoho.eu/oauth/v2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      client_id: process.env.ZOHO_CLIENT_ID!,
      client_secret: process.env.ZOHO_CLIENT_SECRET!,
      refresh_token: process.env.ZOHO_REFRESH_TOKEN!,
    }),
  });

  const data = await res.json();
  if (!data.access_token) {
    throw new Error(`Zoho token refresh failed: ${JSON.stringify(data)}`);
  }

  cachedToken = {
    access_token: data.access_token,
    expires_at: Date.now() + data.expires_in * 1000,
  };

  return cachedToken.access_token;
}

// ─── CRM API ───

export async function crmGet(endpoint: string, params?: Record<string, string>) {
  const token = await getAccessToken();
  const url = new URL(`https://www.zohoapis.eu/crm/v7/${endpoint}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  }
  const res = await fetch(url.toString(), {
    headers: { Authorization: `Zoho-oauthtoken ${token}` },
  });
  // Zoho returns 204 No Content when a search yields no results
  const text = await res.text();
  if (!text) return null;
  try { return JSON.parse(text); } catch { return null; }
}

export async function crmPost(endpoint: string, body: any) {
  const token = await getAccessToken();
  const res = await fetch(`https://www.zohoapis.eu/crm/v7/${endpoint}`, {
    method: "POST",
    headers: {
      Authorization: `Zoho-oauthtoken ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  return res.json();
}

export async function crmPut(endpoint: string, body: any) {
  const token = await getAccessToken();
  const res = await fetch(`https://www.zohoapis.eu/crm/v7/${endpoint}`, {
    method: "PUT",
    headers: {
      Authorization: `Zoho-oauthtoken ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  return res.json();
}

export async function crmSearch(module: string, criteria: string, fields?: string) {
  const params: Record<string, string> = { criteria };
  if (fields) params.fields = fields;
  return crmGet(`${module}/search`, params);
}

// ─── BOOKS API ───

export async function booksGet(endpoint: string, params?: Record<string, string>) {
  const token = await getAccessToken();
  const orgId = process.env.ZOHO_BOOKS_ORG_ID!;
  const url = new URL(`https://www.zohoapis.eu/books/v3/${endpoint}`);
  url.searchParams.set("organization_id", orgId);
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  }
  const res = await fetch(url.toString(), {
    headers: { Authorization: `Zoho-oauthtoken ${token}` },
  });
  return res.json();
}

export async function booksPost(endpoint: string, body: any) {
  const token = await getAccessToken();
  const orgId = process.env.ZOHO_BOOKS_ORG_ID!;
  const url = new URL(`https://www.zohoapis.eu/books/v3/${endpoint}`);
  url.searchParams.set("organization_id", orgId);
  const res = await fetch(url.toString(), {
    method: "POST",
    headers: {
      Authorization: `Zoho-oauthtoken ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  return res.json();
}

// ─── SLACK ───

export async function slackPost(webhookUrl: string, payload: any) {
  await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}
