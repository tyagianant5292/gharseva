import { Suspense } from "react";
import VerifyEmailClient from "@/components/VerifyEmailClient";

export const metadata = { title: "Verify Email — GharSeva" };

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="container-x py-16 text-center text-slate-500">Loading…</div>}>
      <VerifyEmailClient />
    </Suspense>
  );
}
