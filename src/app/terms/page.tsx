import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service — GharSeva",
  description: "The terms that govern your use of GharSeva.",
};

const UPDATED = "12 June 2026";
const CONTACT = "kumaranant5292@gmail.com";

export default function TermsPage() {
  return (
    <div className="container-x max-w-3xl py-10">
      <h1 className="text-3xl font-bold text-slate-900">Terms of Service</h1>
      <p className="mt-1 text-sm text-slate-500">Last updated: {UPDATED}</p>

      <div className="mt-6 space-y-6 text-sm leading-relaxed text-slate-700">
        <p>
          Welcome to GharSeva. By creating an account or using the platform you agree to these Terms.
          If you do not agree, please do not use GharSeva.
        </p>

        <Section title="1. What GharSeva is">
          <p>
            GharSeva is an <b>online marketplace that connects</b> customers with independent
            domestic-service providers in India and the UAE. <b>We are a listing and discovery
            platform only.</b> We are not the employer of any provider, we do not supply labour, and
            we are not a party to any arrangement, hiring, or payment between a customer and a
            provider.
          </p>
        </Section>

        <Section title="2. Eligibility & accounts">
          <ul className="list-disc space-y-1 pl-5">
            <li>You must be at least 18 years old to use GharSeva.</li>
            <li>You are responsible for the accuracy of the information you provide and for keeping your password secure.</li>
            <li>You must not impersonate others, post false information, or create accounts on someone else&apos;s behalf without permission.</li>
          </ul>
        </Section>

        <Section title="3. Verification — what the badge means">
          <p>
            A &quot;Verified&quot; badge reflects a limited check only: in India, review of an
            uploaded ID document by our team; in the UAE, confirmation of the provider&apos;s email
            address. <b>It is not a background check, criminal-record check, or guarantee</b> of a
            provider&apos;s skills, conduct, immigration status, or suitability. Customers should do
            their own due diligence (interview, references, trial, and any legally required checks)
            before hiring.
          </p>
        </Section>

        <Section title="4. Your responsibilities">
          <ul className="list-disc space-y-1 pl-5">
            <li><b>Customers:</b> you are responsible for vetting, hiring, agreeing terms, and complying with all local laws when engaging a provider.</li>
            <li><b>Providers:</b> you are responsible for holding any permits, visas, or work authorisations required where you operate, and for the services you deliver.</li>
            <li>You will use GharSeva lawfully and will not harass, defraud, or harm other users.</li>
          </ul>
        </Section>

        <Section title="5. Local law (important for the UAE)">
          <p>
            The recruitment and employment of domestic workers is regulated and varies by country —
            for example, the UAE channels domestic-worker recruitment through licensed (Tadbeer)
            centres under MOHRE. You are solely responsible for ensuring that your use of GharSeva and
            any hiring you arrange complies with the laws of your country and emirate.
          </p>
        </Section>

        <Section title="6. Reviews & content">
          <p>
            Reviews and profile content must be honest and lawful. You grant us a licence to display
            content you submit on the platform. We may remove content that is abusive, fraudulent, or
            violates these Terms.
          </p>
        </Section>

        <Section title="7. Disclaimers & limitation of liability">
          <p>
            GharSeva is provided &quot;as is&quot; without warranties of any kind. We do not guarantee
            the conduct, quality, or reliability of any user. To the maximum extent permitted by law,
            GharSeva and its operators are not liable for any loss or damage arising from your use of
            the platform or from any interaction, hiring, or dispute between users.
          </p>
        </Section>

        <Section title="8. Suspension & termination">
          <p>
            We may suspend or remove accounts that breach these Terms or harm the platform or its
            users. You may close your account at any time.
          </p>
        </Section>

        <Section title="9. Changes">
          <p>We may update these Terms; continued use after changes means you accept the updated Terms.</p>
        </Section>

        <Section title="10. Contact">
          <p>
            Questions? Email{" "}
            <a href={`mailto:${CONTACT}`} className="text-brand-600 underline">{CONTACT}</a>.
          </p>
        </Section>

        <p className="rounded-lg bg-slate-50 p-4 text-xs text-slate-500 ring-1 ring-slate-200">
          This template is provided for general information and is not legal advice. Please have it
          reviewed by a qualified professional before relying on it for a commercial launch,
          especially regarding domestic-worker regulations in your jurisdiction.
        </p>
      </div>

      <div className="mt-8 text-sm">
        <Link href="/privacy" className="text-brand-600 hover:underline">Read our Privacy Policy →</Link>
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
