import { Suspense } from "react";
import ProvidersBrowser from "@/components/ProvidersBrowser";

export const metadata = { title: "Find Home Helpers — GharSeva" };

export default function ProvidersPage() {
  return (
    <Suspense fallback={<div className="container-x py-10 text-slate-500">Loading…</div>}>
      <ProvidersBrowser />
    </Suspense>
  );
}
