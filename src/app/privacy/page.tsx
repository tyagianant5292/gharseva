import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy — GharSeva",
  description: "How GharSeva collects, uses, and protects your personal information.",
};

const UPDATED = "12 June 2026";
const CONTACT = "kumaranant5292@gmail.com";

export default function PrivacyPage() {
  return (
    <div className="container-x max-w-3xl py-10">
      <h1 className="text-3xl font-bold text-slate-900">Privacy Policy</h1>
      <p className="mt-1 text-sm text-slate-500">Last updated: {UPDATED}</p>

      <div className="prose-gs mt-6 space-y-6 text-sm leading-relaxed text-slate-700">
        <p>
          GharSeva (&quot;we&quot;, &quot;us&quot;) connects customers with domestic-service providers
          (maids, cooks, nannies, drivers and similar help) in India and the United Arab Emirates.
          This policy explains what personal data we collect, why, and your choices. By using
          GharSeva you agree to this policy.
        </p>

        <Section title="1. Information we collect">
          <ul className="list-disc space-y-1 pl-5">
            <li><b>Account details:</b> your name, mobile number, and (optionally) email address and password.</li>
            <li><b>Provider profile:</b> services offered, country, city/area, experience, expected salary, gender, a short bio, and an optional profile photo.</li>
            <li><b>Verification documents (India only):</b> if you choose document verification, an ID proof (e.g. Aadhaar/PAN/Driving Licence) image or PDF. <b>In the UAE we do not collect or store ID documents</b> — verification there is by email only.</li>
            <li><b>Location:</b> an approximate map pin (latitude/longitude) only if you choose to share it for &quot;near me&quot; search.</li>
            <li><b>Usage data:</b> which provider contacts you unlock (recorded as a lead), reviews and booking requests you make.</li>
          </ul>
        </Section>

        <Section title="2. How we use your information">
          <ul className="list-disc space-y-1 pl-5">
            <li>To create and operate your account and provider listing.</li>
            <li>To let customers search for and contact providers.</li>
            <li>To verify accounts (email confirmation, and in India optional document review by our admin).</li>
            <li>To send service emails (verification, booking notifications) via our email provider (Brevo).</li>
            <li>To prevent abuse and keep the platform safe.</li>
          </ul>
        </Section>

        <Section title="3. What we share">
          <p>
            A provider&apos;s contact details (mobile, and email if given) are revealed only to
            <b> logged-in users</b> who choose to unlock them; each unlock is logged. We do not sell
            your personal data. We use trusted processors only to run the service — hosting (Vercel),
            database (Neon), and email delivery (Brevo). We may disclose information if required by law.
          </p>
        </Section>

        <Section title="4. Cookies">
          <p>
            We use a single essential cookie (<code>gs_session</code>) to keep you logged in. It is
            strictly necessary for the service to work; we do not use advertising or third-party
            tracking cookies.
          </p>
        </Section>

        <Section title="5. Data retention &amp; security">
          <p>
            We keep your data for as long as your account is active. You can ask us to delete your
            account and associated data at any time (see contact below). Passwords are stored hashed
            (bcrypt), and data is transmitted over HTTPS. No online service can be 100% secure, but we
            take reasonable measures to protect your information.
          </p>
        </Section>

        <Section title="6. Your rights">
          <p>
            You can access, correct, or delete your information from your{" "}
            <Link href="/account" className="text-brand-600 underline">account</Link> page, or by
            emailing us. Depending on where you live, you may have rights under India&apos;s Digital
            Personal Data Protection Act, 2023 and the UAE&apos;s Federal Personal Data Protection Law
            (PDPL). To exercise any right, contact us at the address below.
          </p>
        </Section>

        <Section title="7. Children">
          <p>GharSeva is not intended for anyone under 18. We do not knowingly collect data from minors.</p>
        </Section>

        <Section title="8. Changes">
          <p>We may update this policy; we will revise the &quot;Last updated&quot; date above when we do.</p>
        </Section>

        <Section title="9. Contact">
          <p>
            Questions or requests? Email{" "}
            <a href={`mailto:${CONTACT}`} className="text-brand-600 underline">{CONTACT}</a>.
          </p>
        </Section>

        <p className="rounded-lg bg-slate-50 p-4 text-xs text-slate-500 ring-1 ring-slate-200">
          This template is provided for general information and is not legal advice. Please have it
          reviewed by a qualified professional before relying on it for a commercial launch.
        </p>
      </div>

      <div className="mt-8 text-sm">
        <Link href="/terms" className="text-brand-600 hover:underline">Read our Terms of Service →</Link>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      <div className="mt-2 space-y-2">{children}</div>
    </section>
  );
}
