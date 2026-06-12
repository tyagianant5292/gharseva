import { randomBytes } from "crypto";

// Brevo (https://brevo.com) transactional email over HTTPS — works on Vercel
// (no SMTP). Set BREVO_API_KEY + MAIL_FROM. Without a key, emails are skipped.
const BREVO_API_KEY = process.env.BREVO_API_KEY;
const MAIL_FROM = process.env.MAIL_FROM || "no-reply@gharseva.app";
const MAIL_FROM_NAME = process.env.MAIL_FROM_NAME || "GharSeva";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export function newToken(): string {
  return randomBytes(32).toString("hex");
}

export function emailEnabled(): boolean {
  return Boolean(BREVO_API_KEY);
}

async function send(to: string, name: string, subject: string, html: string): Promise<boolean> {
  if (!BREVO_API_KEY) {
    console.log(`[email] (disabled — no BREVO_API_KEY) would send "${subject}" to ${to}`);
    return false;
  }
  try {
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": BREVO_API_KEY,
        "Content-Type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({
        sender: { email: MAIL_FROM, name: MAIL_FROM_NAME },
        to: [{ email: to, name }],
        subject,
        htmlContent: html,
      }),
    });
    if (!res.ok) {
      console.error("[email] brevo error:", res.status, (await res.text()).slice(0, 200));
      return false;
    }
    return true;
  } catch (e) {
    console.error("[email] send failed:", (e as Error).message);
    return false;
  }
}

export async function sendVerificationEmail(to: string, name: string, token: string): Promise<boolean> {
  const link = `${SITE_URL}/verify-email?token=${token}`;
  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:480px;margin:auto">
      <h2 style="color:#ea580c">Welcome to GharSeva, ${escapeHtml(name)}!</h2>
      <p>Please confirm your email address to activate your account.</p>
      <p style="margin:24px 0">
        <a href="${link}" style="background:#ea580c;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:600">
          Verify my email
        </a>
      </p>
      <p style="color:#64748b;font-size:13px">Or paste this link into your browser:<br>${link}</p>
      <p style="color:#94a3b8;font-size:12px">If you didn't sign up for GharSeva, you can ignore this email.</p>
    </div>`;
  return send(to, name, "Verify your GharSeva email", html);
}

export async function sendVerificationResultEmail(
  to: string,
  name: string,
  approved: boolean,
  note?: string | null,
): Promise<boolean> {
  const subject = approved
    ? "Your GharSeva profile is verified ✅"
    : "Your GharSeva verification needs attention";
  const html = approved
    ? `<div style="font-family:system-ui,sans-serif;max-width:480px;margin:auto">
        <h2 style="color:#0d9488">You're verified, ${escapeHtml(name)}! ✅</h2>
        <p>Your documents were approved. Your profile now shows the <b>Verified</b> badge, so families can trust and contact you with confidence.</p>
        <p style="margin:20px 0"><a href="${SITE_URL}/dashboard" style="background:#ea580c;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:600">Open my profile</a></p>
      </div>`
    : `<div style="font-family:system-ui,sans-serif;max-width:480px;margin:auto">
        <h2 style="color:#dc2626">Verification not approved</h2>
        <p>Hi ${escapeHtml(name)}, we couldn't approve your documents this time.</p>
        ${note ? `<p style="background:#fef2f2;padding:10px 14px;border-radius:8px;color:#991b1b">Reason: ${escapeHtml(note)}</p>` : ""}
        <p>Please re-upload a clear ID from your dashboard.</p>
        <p style="margin:20px 0"><a href="${SITE_URL}/dashboard" style="background:#ea580c;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:600">Re-upload documents</a></p>
      </div>`;
  return send(to, name, subject, html);
}

// Alerts the admin(s) that a provider submitted documents for verification.
export async function sendAdminVerificationAlert(providerName: string, idDocType: string): Promise<void> {
  const admins = (process.env.ADMIN_EMAILS || MAIL_FROM)
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);
  const subject = `🔔 New verification to review: ${providerName}`;
  const html = `<div style="font-family:system-ui,sans-serif;max-width:480px;margin:auto">
      <h2 style="color:#ea580c">New verification pending</h2>
      <p><b>${escapeHtml(providerName)}</b> submitted <b>${escapeHtml(idDocType)}</b> document(s) for verification.</p>
      <p style="margin:20px 0"><a href="${SITE_URL}/admin" style="background:#ea580c;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:600">Review in admin panel</a></p>
    </div>`;
  await Promise.all(admins.map((a) => send(a, "Admin", subject, html)));
}

export async function sendBookingRequestEmail(
  to: string,
  providerName: string,
  customerName: string,
  service?: string | null,
): Promise<boolean> {
  const html = `<div style="font-family:system-ui,sans-serif;max-width:480px;margin:auto">
      <h2 style="color:#ea580c">New booking request</h2>
      <p>Hi ${escapeHtml(providerName)}, <b>${escapeHtml(customerName)}</b> has requested your help${service ? ` for <b>${escapeHtml(service)}</b>` : ""}.</p>
      <p style="margin:20px 0"><a href="${SITE_URL}/dashboard" style="background:#ea580c;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:600">View &amp; respond</a></p>
    </div>`;
  return send(to, providerName, "New booking request on GharSeva", html);
}

export async function sendInstantBookingRequestEmail(
  to: string,
  providerName: string,
  customerName: string,
  service: string,
  dateRange: string,
  days: number,
  total: string,
): Promise<boolean> {
  const html = `<div style="font-family:system-ui,sans-serif;max-width:480px;margin:auto">
      <h2 style="color:#ea580c">⚡ New daily booking request</h2>
      <p>Hi ${escapeHtml(providerName)}, <b>${escapeHtml(customerName)}</b> wants to book you for <b>${escapeHtml(service)}</b>.</p>
      <p style="background:#fff7ed;border:1px solid #fed7aa;border-radius:8px;padding:12px">
        <b>Dates:</b> ${escapeHtml(dateRange)} (${days} ${days === 1 ? "day" : "days"})<br/>
        <b>Total:</b> ${escapeHtml(total)} <span style="color:#92400e">(payable directly on arrival)</span>
      </p>
      <p style="margin:20px 0"><a href="${SITE_URL}/dashboard" style="background:#ea580c;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:600">Accept or decline</a></p>
    </div>`;
  return send(to, providerName, "New daily booking request on GharSeva", html);
}

export async function sendBookingStatusEmail(
  to: string,
  customerName: string,
  providerName: string,
  accepted: boolean,
  reason?: string | null,
): Promise<boolean> {
  const subject = accepted ? `${providerName} accepted your request ✅` : `${providerName} declined your request`;
  const reasonHtml =
    !accepted && reason
      ? `<p style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:12px;color:#991b1b"><b>Reason:</b> ${escapeHtml(reason)}</p>`
      : "";
  const html = `<div style="font-family:system-ui,sans-serif;max-width:480px;margin:auto">
      <h2 style="color:${accepted ? "#0d9488" : "#dc2626"}">${accepted ? "Request accepted 🎉" : "Request declined"}</h2>
      <p>Hi ${escapeHtml(customerName)}, <b>${escapeHtml(providerName)}</b> has ${accepted ? "accepted" : "declined"} your booking request.</p>
      ${accepted ? `<p>You can now contact them directly to arrange the details.</p>` : reasonHtml}
      <p style="margin:20px 0"><a href="${SITE_URL}/requests" style="background:#ea580c;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:600">View my requests</a></p>
    </div>`;
  return send(to, customerName, subject, html);
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string,
  );
}
