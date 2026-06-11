import type { SessionUser } from "./auth";

// Admins are designated by email (ADMIN_EMAILS env, comma-separated) or DB role.
export function isAdmin(user: SessionUser | null): boolean {
  if (!user) return false;
  if (user.role === "ADMIN") return true;
  const emails = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return emails.includes(user.email.toLowerCase());
}
