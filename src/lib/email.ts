/**
 * Email sending via Resend (https://resend.com)
 *
 * ENV VARS:
 *   RESEND_API_KEY  — from resend.com dashboard (starts with re_)
 *   SITE_URL        — e.g. https://labelorigin.com
 *
 * Free tier: 3,000 emails/month, 100/day — more than enough for a client portal.
 * Sign up at https://resend.com → API Keys → Create API Key
 */

const BOOKINGS_URL = "https://cal.eu/labelorigin/discovery-call";

export async function sendEnquiryConfirmationEmail(
  toEmail: string,
  name: string,
  productFormat: string,
): Promise<{ success: boolean }> {
  const firstName = name?.split(" ")[0] || name || "";

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
</head>
<body style="margin:0;padding:0;background:#f5f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #d2d2d7;">

          <!-- Header -->
          <tr>
            <td style="padding:32px 40px 24px;border-bottom:1px solid #f5f5f7;">
              <p style="margin:0;font-size:15px;font-weight:600;color:#1d1d1f;letter-spacing:-0.01em;">LABEL ORIGIN</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px;">
              <p style="margin:0 0 16px;font-size:24px;font-weight:600;color:#1d1d1f;letter-spacing:-0.02em;">
                Brief received.
              </p>
              <p style="margin:0 0 8px;font-size:15px;color:#86868b;line-height:1.6;">
                Hi ${firstName},
              </p>
              <p style="margin:0 0 32px;font-size:15px;color:#86868b;line-height:1.6;">
                Thanks for getting in touch. We've received your enquiry for a <strong style="color:#1d1d1f;">${productFormat}</strong> and a member of our team will be in touch within 24 hours.
              </p>
              <p style="margin:0 0 32px;font-size:15px;color:#86868b;line-height:1.6;">
                In the meantime, book a free 30-minute discovery call to walk through your brief, ask questions, and get a feel for how we work.
              </p>

              <!-- CTA -->
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="border-radius:12px;background:#0071e3;">
                    <a href="${BOOKINGS_URL}"
                       style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:500;color:#ffffff;text-decoration:none;letter-spacing:-0.01em;">
                      Book a discovery call →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:28px 0 0;font-size:13px;color:#86868b;line-height:1.6;">
                30 minutes · free · no commitment
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px;border-top:1px solid #f5f5f7;">
              <p style="margin:0;font-size:12px;color:#86868b;line-height:1.5;">
                Label Origin Ltd · UK Contract Manufacturer · ISO9001 Accredited
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.log(`[enquiry confirmation] RESEND_API_KEY not set — email not sent to ${toEmail}`);
    return { success: false };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Label Origin <hello@labelorigin.com>",
      to:   [toEmail],
      subject: "We've received your brief — book a discovery call",
      html,
    }),
  });

  if (!res.ok) {
    console.error("[enquiry confirmation] Resend error:", await res.text());
    return { success: false };
  }

  return { success: true };
}

export async function sendBookingConfirmedEmail(
  toEmail: string,
  name: string,
  startTime: string,
): Promise<{ success: boolean }> {
  const firstName = name?.split(" ")[0] || name || "";
  const siteUrl = process.env.SITE_URL || "https://medvi-clone.vercel.app";

  // Format the date nicely
  let formattedDate = startTime;
  try {
    formattedDate = new Date(startTime).toLocaleString("en-GB", {
      weekday: "long", day: "numeric", month: "long",
      hour: "2-digit", minute: "2-digit", timeZone: "Europe/London",
    });
  } catch {}

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
</head>
<body style="margin:0;padding:0;background:#f5f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #d2d2d7;">

          <!-- Header -->
          <tr>
            <td style="padding:32px 40px 24px;border-bottom:1px solid #f5f5f7;">
              <p style="margin:0;font-size:15px;font-weight:600;color:#1d1d1f;letter-spacing:-0.01em;">LABEL ORIGIN</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px;">
              <p style="margin:0 0 16px;font-size:24px;font-weight:600;color:#1d1d1f;letter-spacing:-0.02em;">
                Your call is confirmed.
              </p>
              <p style="margin:0 0 8px;font-size:15px;color:#86868b;line-height:1.6;">Hi ${firstName},</p>
              <p style="margin:0 0 32px;font-size:15px;color:#86868b;line-height:1.6;">
                We're looking forward to speaking with you on <strong style="color:#1d1d1f;">${formattedDate}</strong>.
              </p>

              <p style="margin:0 0 16px;font-size:15px;font-weight:600;color:#1d1d1f;">Before the call</p>
              <p style="margin:0 0 32px;font-size:15px;color:#86868b;line-height:1.6;">
                To make the most of our time together, please fill in your pre-call brief. It takes about 3 minutes and helps us come prepared with relevant ideas, pricing benchmarks, and formulation suggestions.
              </p>

              <!-- CTA -->
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="border-radius:12px;background:#0071e3;">
                    <a href="${siteUrl}/login"
                       style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:500;color:#ffffff;text-decoration:none;letter-spacing:-0.01em;">
                      Complete your brief →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:28px 0 0;font-size:13px;color:#86868b;line-height:1.6;">
                Log in to your client portal and you'll see the brief checklist on your dashboard.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px;border-top:1px solid #f5f5f7;">
              <p style="margin:0;font-size:12px;color:#86868b;line-height:1.5;">
                Label Origin Ltd · UK Contract Manufacturer · ISO9001 Accredited
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.log(`[booking confirmed] RESEND_API_KEY not set — email not sent to ${toEmail}`);
    return { success: false };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Label Origin <hello@labelorigin.com>",
      to:   [toEmail],
      subject: `Your discovery call is confirmed — ${formattedDate}`,
      html,
    }),
  });

  if (!res.ok) {
    console.error("[booking confirmed] Resend error:", await res.text());
    return { success: false };
  }

  return { success: true };
}

export async function sendBriefAcknowledgementEmail(
  toEmail: string,
  name: string,
): Promise<{ success: boolean }> {
  const firstName = name?.split(" ")[0] || name || "";
  const siteUrl = process.env.SITE_URL || "https://labelorigin.com";

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
</head>
<body style="margin:0;padding:0;background:#f5f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #d2d2d7;">
          <tr>
            <td style="padding:32px 40px 24px;border-bottom:1px solid #f5f5f7;">
              <p style="margin:0;font-size:15px;font-weight:600;color:#1d1d1f;letter-spacing:-0.01em;">LABEL ORIGIN</p>
            </td>
          </tr>
          <tr>
            <td style="padding:36px 40px;">
              <p style="margin:0 0 16px;font-size:24px;font-weight:600;color:#1d1d1f;letter-spacing:-0.02em;">Brief received.</p>
              <p style="margin:0 0 8px;font-size:15px;color:#86868b;line-height:1.6;">Hi ${firstName},</p>
              <p style="margin:0 0 32px;font-size:15px;color:#86868b;line-height:1.6;">
                Thank you for completing your pre-call brief. Our team will review your answers and come back to you with a tailored proposal shortly.
              </p>
              <p style="margin:0 0 32px;font-size:15px;color:#86868b;line-height:1.6;">
                In the meantime, you can log into your portal to check the status of your enquiry.
              </p>
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="border-radius:12px;background:#0071e3;">
                    <a href="${siteUrl}/login"
                       style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:500;color:#ffffff;text-decoration:none;letter-spacing:-0.01em;">
                      View your portal →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 40px;border-top:1px solid #f5f5f7;">
              <p style="margin:0;font-size:12px;color:#86868b;line-height:1.5;">
                Label Origin Ltd · UK Contract Manufacturer · ISO9001 Accredited
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.log(`[brief ack] RESEND_API_KEY not set — email not sent to ${toEmail}`);
    return { success: false };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Label Origin <hello@labelorigin.com>",
      to:   [toEmail],
      subject: "We've received your brief — our team will be in touch",
      html,
    }),
  });

  if (!res.ok) {
    console.error("[brief ack] Resend error:", await res.text());
    return { success: false };
  }

  return { success: true };
}

export async function sendFollowUpEmail(
  toEmail: string,
  name: string,
): Promise<{ success: boolean }> {
  const firstName = name?.split(" ")[0] || name || "";

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
</head>
<body style="margin:0;padding:0;background:#f5f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #d2d2d7;">

          <!-- Header -->
          <tr>
            <td style="padding:32px 40px 24px;border-bottom:1px solid #f5f5f7;">
              <p style="margin:0;font-size:15px;font-weight:600;color:#1d1d1f;letter-spacing:-0.01em;">LABEL ORIGIN</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px;">
              <p style="margin:0 0 16px;font-size:24px;font-weight:600;color:#1d1d1f;letter-spacing:-0.02em;">
                Still thinking it over?
              </p>
              <p style="margin:0 0 8px;font-size:15px;color:#86868b;line-height:1.6;">
                Hi ${firstName},
              </p>
              <p style="margin:0 0 32px;font-size:15px;color:#86868b;line-height:1.6;">
                We noticed you haven't booked a discovery call yet. It's only 30 minutes — and a great way to see whether we're the right fit before committing to anything.
              </p>

              <!-- CTA -->
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="border-radius:12px;background:#0071e3;">
                    <a href="${BOOKINGS_URL}"
                       style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:500;color:#ffffff;text-decoration:none;letter-spacing:-0.01em;">
                      Book a discovery call →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:28px 0 0;font-size:13px;color:#86868b;line-height:1.6;">
                30 minutes · free · no commitment
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px;border-top:1px solid #f5f5f7;">
              <p style="margin:0;font-size:12px;color:#86868b;line-height:1.5;">
                Label Origin Ltd · UK Contract Manufacturer · ISO9001 Accredited
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.log(`[follow-up] RESEND_API_KEY not set — email not sent to ${toEmail}`);
    return { success: false };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Label Origin <hello@labelorigin.com>",
      to:   [toEmail],
      subject: "Still interested? Book your free discovery call",
      html,
    }),
  });

  if (!res.ok) {
    console.error("[follow-up] Resend error:", await res.text());
    return { success: false };
  }

  return { success: true };
}

export async function sendProposalEmail(
  toEmail: string,
  name: string,
  deal: {
    dealName: string;
    quoteTotal?: number | null;
    wholesalePrice?: number | null;
    suggestedRrp?: number | null;
    moq?: number | null;
    clientMargin?: number | null;
    productFormat?: string | null;
  }
): Promise<{ success: boolean }> {
  const firstName = name?.split(" ")[0] || name || "";
  const siteUrl = process.env.SITE_URL || "https://labelorigin.com";

  const fmtGbp = (v?: number | null) =>
    v != null ? `£${Number(v).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : null;

  const hasPricing = deal.wholesalePrice || deal.quoteTotal;

  const pricingRows = [
    deal.wholesalePrice  && { label: "Cost per unit",   value: fmtGbp(deal.wholesalePrice)! },
    deal.suggestedRrp    && { label: "Suggested RRP",   value: fmtGbp(deal.suggestedRrp)! },
    deal.clientMargin    && { label: "Your margin",     value: `${deal.clientMargin}%` },
    deal.moq             && { label: "Min. order qty",  value: `${Number(deal.moq).toLocaleString()} units` },
    deal.quoteTotal      && { label: "Order total",     value: fmtGbp(deal.quoteTotal)! },
  ].filter(Boolean) as { label: string; value: string }[];

  const pricingTableHtml = hasPricing ? `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 32px;border-radius:12px;overflow:hidden;border:1px solid #d2d2d7;">
      ${pricingRows.map((r, i) => `
        <tr style="background:${i % 2 === 0 ? "#f9f9f9" : "#ffffff"};">
          <td style="padding:10px 16px;font-size:13px;color:#86868b;">${r.label}</td>
          <td style="padding:10px 16px;font-size:13px;font-weight:600;color:#1d1d1f;text-align:right;">${r.value}</td>
        </tr>
      `).join("")}
    </table>
  ` : "";

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
</head>
<body style="margin:0;padding:0;background:#f5f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #d2d2d7;">

          <!-- Header -->
          <tr>
            <td style="padding:32px 40px 24px;border-bottom:1px solid #f5f5f7;">
              <p style="margin:0;font-size:15px;font-weight:600;color:#1d1d1f;letter-spacing:-0.01em;">LABEL ORIGIN</p>
            </td>
          </tr>

          <!-- Proposal ready banner -->
          <tr>
            <td style="padding:0;">
              <div style="background:#0071e3;padding:20px 40px;">
                <p style="margin:0;font-size:12px;font-weight:600;color:rgba(255,255,255,0.7);letter-spacing:0.08em;text-transform:uppercase;">Your proposal is ready</p>
              </div>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px;">
              <p style="margin:0 0 16px;font-size:24px;font-weight:600;color:#1d1d1f;letter-spacing:-0.02em;">
                ${deal.dealName}
              </p>
              <p style="margin:0 0 8px;font-size:15px;color:#86868b;line-height:1.6;">
                Hi ${firstName},
              </p>
              <p style="margin:0 0 32px;font-size:15px;color:#86868b;line-height:1.6;">
                We've reviewed your brief${deal.productFormat ? ` for your <strong style="color:#1d1d1f;">${deal.productFormat}</strong>` : ""} and put together a tailored proposal. You can review the full details and accept directly in your portal.
              </p>

              ${pricingTableHtml}

              <!-- CTA -->
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="border-radius:12px;background:#0071e3;">
                    <a href="${siteUrl}/login"
                       style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:500;color:#ffffff;text-decoration:none;letter-spacing:-0.01em;">
                      View your proposal →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:20px 0 0;font-size:13px;color:#86868b;line-height:1.6;">
                Log in to your portal to review the full proposal, ask questions, or accept to begin sample development.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px;border-top:1px solid #f5f5f7;">
              <p style="margin:0;font-size:12px;color:#86868b;line-height:1.5;">
                Label Origin Ltd · UK Contract Manufacturer · ISO9001 Accredited
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.log(`[proposal] RESEND_API_KEY not set — email not sent to ${toEmail}`);
    return { success: false };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Label Origin <hello@labelorigin.com>",
      to:   [toEmail],
      subject: `Your proposal is ready — ${deal.dealName}`,
      html,
    }),
  });

  if (!res.ok) {
    console.error("[proposal] Resend error:", await res.text());
    return { success: false };
  }

  return { success: true };
}

export async function sendDepositInvoiceEmail(
  toEmail: string,
  name: string,
  deal: {
    dealName: string;
    invoiceNumber: string;
    invoiceTotal: number;
    dueDate: string;
    currency: string;
  }
): Promise<{ success: boolean }> {
  const firstName = name?.split(" ")[0] || name || "";
  const siteUrl = process.env.SITE_URL || "https://labelorigin.com";
  const portalUrl = `${siteUrl}/login`;

  const formattedTotal = `${deal.currency} ${Number(deal.invoiceTotal).toLocaleString("en-GB", { minimumFractionDigits: 2 })}`;
  const formattedDue = deal.dueDate
    ? new Date(deal.dueDate).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
    : "";

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
</head>
<body style="margin:0;padding:0;background:#f5f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #d2d2d7;">

          <!-- Header -->
          <tr>
            <td style="padding:32px 40px 24px;border-bottom:1px solid #f5f5f7;">
              <p style="margin:0;font-size:15px;font-weight:600;color:#1d1d1f;letter-spacing:-0.01em;">LABEL ORIGIN</p>
            </td>
          </tr>

          <!-- Banner -->
          <tr>
            <td style="padding:0;">
              <div style="background:#1d1d1f;padding:20px 40px;">
                <p style="margin:0;font-size:12px;font-weight:600;color:rgba(255,255,255,0.6);letter-spacing:0.08em;text-transform:uppercase;">Deposit invoice ready</p>
              </div>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px;">
              <p style="margin:0 0 16px;font-size:24px;font-weight:600;color:#1d1d1f;letter-spacing:-0.02em;">${deal.dealName}</p>
              <p style="margin:0 0 8px;font-size:15px;color:#86868b;line-height:1.6;">Hi ${firstName},</p>
              <p style="margin:0 0 32px;font-size:15px;color:#86868b;line-height:1.6;">
                Your 50% deposit invoice is ready. Once paid, we'll begin production immediately.
              </p>

              <!-- Invoice summary -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 32px;border-radius:12px;overflow:hidden;border:1px solid #d2d2d7;">
                <tr style="background:#f9f9f9;">
                  <td style="padding:10px 16px;font-size:13px;color:#86868b;">Invoice</td>
                  <td style="padding:10px 16px;font-size:13px;font-weight:600;color:#1d1d1f;text-align:right;">${deal.invoiceNumber}</td>
                </tr>
                <tr style="background:#ffffff;">
                  <td style="padding:10px 16px;font-size:13px;color:#86868b;">Amount due</td>
                  <td style="padding:10px 16px;font-size:13px;font-weight:600;color:#1d1d1f;text-align:right;">${formattedTotal}</td>
                </tr>
                ${formattedDue ? `
                <tr style="background:#f9f9f9;">
                  <td style="padding:10px 16px;font-size:13px;color:#86868b;">Due date</td>
                  <td style="padding:10px 16px;font-size:13px;font-weight:600;color:#1d1d1f;text-align:right;">${formattedDue}</td>
                </tr>` : ""}
              </table>

              <!-- CTA -->
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="border-radius:12px;background:#0071e3;">
                    <a href="${portalUrl}"
                       style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:500;color:#ffffff;text-decoration:none;letter-spacing:-0.01em;">
                      View invoice in portal →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:20px 0 0;font-size:13px;color:#86868b;line-height:1.6;">
                You can also view this invoice in your <a href="${siteUrl}/login" style="color:#0071e3;text-decoration:none;">client portal</a> under the Invoices tab.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px;border-top:1px solid #f5f5f7;">
              <p style="margin:0;font-size:12px;color:#86868b;line-height:1.5;">
                Label Origin Ltd · UK Contract Manufacturer · ISO9001 Accredited
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.log(`[deposit invoice] RESEND_API_KEY not set — email not sent to ${toEmail}`);
    return { success: false };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Label Origin <hello@labelorigin.com>",
      to:   [toEmail],
      subject: `Deposit invoice ready — ${deal.dealName}`,
      html,
      ...(pdfBuffer ? {
        attachments: [{
          filename: `Invoice-${deal.invoiceNumber}.pdf`,
          content: pdfBuffer.toString("base64"),
        }],
      } : {}),
    }),
  });

  if (!res.ok) {
    console.error("[deposit invoice] Resend error:", await res.text());
    return { success: false };
  }

  return { success: true };
}

export async function sendFinalInvoiceEmail(
  toEmail: string,
  name: string,
  deal: {
    dealName: string;
    invoiceNumber: string;
    invoiceTotal: number;
    dueDate: string;
    currency: string;
  }
): Promise<{ success: boolean }> {
  const firstName = name?.split(" ")[0] || name || "";
  const siteUrl = process.env.SITE_URL || "https://labelorigin.com";
  const portalUrl = `${siteUrl}/login`;

  const formattedTotal = `${deal.currency} ${Number(deal.invoiceTotal).toLocaleString("en-GB", { minimumFractionDigits: 2 })}`;
  const formattedDue = deal.dueDate
    ? new Date(deal.dueDate).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
    : "";

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
</head>
<body style="margin:0;padding:0;background:#f5f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #d2d2d7;">

          <!-- Header -->
          <tr>
            <td style="padding:32px 40px 24px;border-bottom:1px solid #f5f5f7;">
              <p style="margin:0;font-size:15px;font-weight:600;color:#1d1d1f;letter-spacing:-0.01em;">LABEL ORIGIN</p>
            </td>
          </tr>

          <!-- Banner -->
          <tr>
            <td style="padding:0;">
              <div style="background:#1d1d1f;padding:20px 40px;">
                <p style="margin:0;font-size:12px;font-weight:600;color:rgba(255,255,255,0.6);letter-spacing:0.08em;text-transform:uppercase;">Final balance invoice ready</p>
              </div>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px;">
              <p style="margin:0 0 16px;font-size:24px;font-weight:600;color:#1d1d1f;letter-spacing:-0.02em;">${deal.dealName}</p>
              <p style="margin:0 0 8px;font-size:15px;color:#86868b;line-height:1.6;">Hi ${firstName},</p>
              <p style="margin:0 0 32px;font-size:15px;color:#86868b;line-height:1.6;">
                Your final balance invoice is ready. Once payment is received, your order will be shipped.
              </p>

              <!-- Invoice summary -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 32px;border-radius:12px;overflow:hidden;border:1px solid #d2d2d7;">
                <tr style="background:#f9f9f9;">
                  <td style="padding:10px 16px;font-size:13px;color:#86868b;">Invoice</td>
                  <td style="padding:10px 16px;font-size:13px;font-weight:600;color:#1d1d1f;text-align:right;">${deal.invoiceNumber}</td>
                </tr>
                <tr style="background:#ffffff;">
                  <td style="padding:10px 16px;font-size:13px;color:#86868b;">Amount due</td>
                  <td style="padding:10px 16px;font-size:13px;font-weight:600;color:#1d1d1f;text-align:right;">${formattedTotal}</td>
                </tr>
                ${formattedDue ? `
                <tr style="background:#f9f9f9;">
                  <td style="padding:10px 16px;font-size:13px;color:#86868b;">Due date</td>
                  <td style="padding:10px 16px;font-size:13px;font-weight:600;color:#1d1d1f;text-align:right;">${formattedDue}</td>
                </tr>` : ""}
              </table>

              <!-- CTA -->
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="border-radius:12px;background:#0071e3;">
                    <a href="${portalUrl}"
                       style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:500;color:#ffffff;text-decoration:none;letter-spacing:-0.01em;">
                      View invoice in portal →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:20px 0 0;font-size:13px;color:#86868b;line-height:1.6;">
                You can also view this invoice in your <a href="${siteUrl}/login" style="color:#0071e3;text-decoration:none;">client portal</a> under the Invoices tab.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px;border-top:1px solid #f5f5f7;">
              <p style="margin:0;font-size:12px;color:#86868b;line-height:1.5;">
                Label Origin Ltd · UK Contract Manufacturer · ISO9001 Accredited
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.log(`[final invoice] RESEND_API_KEY not set — email not sent to ${toEmail}`);
    return { success: false };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Label Origin <hello@labelorigin.com>",
      to:   [toEmail],
      subject: `Final balance invoice ready — ${deal.dealName}`,
      html,
      ...(pdfBuffer ? {
        attachments: [{
          filename: `Invoice-${deal.invoiceNumber}.pdf`,
          content: pdfBuffer.toString("base64"),
        }],
      } : {}),
    }),
  });

  if (!res.ok) {
    console.error("[final invoice] Resend error:", await res.text());
    return { success: false };
  }

  return { success: true };
}

export async function sendMagicLinkEmail(
  toEmail: string,
  contactName: string,
  token: string
): Promise<{ success: boolean; magicLink: string }> {
  const siteUrl = process.env.SITE_URL || "http://localhost:3000";
  const magicLink = `${siteUrl}/portal/verify?token=${token}`;
  const firstName = contactName?.split(" ")[0] || "";

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
</head>
<body style="margin:0;padding:0;background:#f5f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #d2d2d7;">

          <!-- Header -->
          <tr>
            <td style="padding:32px 40px 24px;border-bottom:1px solid #f5f5f7;">
              <p style="margin:0;font-size:15px;font-weight:600;color:#1d1d1f;letter-spacing:-0.01em;">LABEL ORIGIN</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px;">
              <p style="margin:0 0 16px;font-size:24px;font-weight:600;color:#1d1d1f;letter-spacing:-0.02em;">
                Your portal access link
              </p>
              <p style="margin:0 0 8px;font-size:15px;color:#86868b;line-height:1.6;">
                Hi${firstName ? ` ${firstName}` : ""},
              </p>
              <p style="margin:0 0 32px;font-size:15px;color:#86868b;line-height:1.6;">
                Click the button below to access your Label Origin client portal. This link is valid for <strong style="color:#1d1d1f;">15 minutes</strong> and can only be used once.
              </p>

              <!-- CTA -->
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="border-radius:12px;background:#0071e3;">
                    <a href="${magicLink}"
                       style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:500;color:#ffffff;text-decoration:none;letter-spacing:-0.01em;">
                      Access Portal →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:28px 0 0;font-size:13px;color:#86868b;line-height:1.6;">
                Or copy this link into your browser:<br />
                <a href="${magicLink}" style="color:#0071e3;word-break:break-all;">${magicLink}</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px;border-top:1px solid #f5f5f7;">
              <p style="margin:0;font-size:12px;color:#86868b;line-height:1.5;">
                If you didn't request this link, you can safely ignore this email. Someone may have entered your email address by mistake.
              </p>
              <p style="margin:12px 0 0;font-size:12px;color:#d2d2d7;">
                Label Origin Ltd · UK Contract Manufacturer · ISO9001 Accredited
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  // ── Dev mode: always log the link ────────────────────────────────────────
  console.log(`\n[MAGIC LINK] ${toEmail}\n→ ${magicLink}\n`);

  // ── Production: send via Resend ──────────────────────────────────────────
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.warn("[email] RESEND_API_KEY not set — email not sent. Link logged above.");
    return { success: true, magicLink };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Label Origin <hello@labelorigin.com>",
      to:   [toEmail],
      subject: "Your Label Origin portal access link",
      html,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("[email] Resend error:", err);
    // Don't throw — link still usable in dev via console
    return { success: true, magicLink };
  }

  return { success: true, magicLink };
}
