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

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string,
  );
}
