"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { BadgeCheck, XCircle, Loader2 } from "lucide-react";

export default function VerifyEmailClient() {
  const token = useSearchParams().get("token");
  const [state, setState] = useState<"loading" | "ok" | "error">("loading");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (!token) {
      setState("error");
      setMsg("No verification token found.");
      return;
    }
    (async () => {
      try {
        const res = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        const d = await res.json();
        if (!res.ok) throw new Error(d.error || "Verification failed");
        setState("ok");
      } catch (e) {
        setState("error");
        setMsg(e instanceof Error ? e.message : "Verification failed");
      }
    })();
  }, [token]);

  return (
    <div className="container-x max-w-md py-16 text-center">
      <div className="card p-8">
        {state === "loading" && (
          <>
            <Loader2 className="mx-auto animate-spin text-brand-600" size={40} />
            <p className="mt-4 text-slate-600">Verifying your email…</p>
          </>
        )}
        {state === "ok" && (
          <>
            <BadgeCheck className="mx-auto text-teal-600" size={48} />
            <h1 className="mt-4 text-xl font-bold text-slate-900">Email verified!</h1>
            <p className="mt-1 text-slate-500">Your email address is now confirmed.</p>
            <Link href="/" className="btn-primary mt-6">
              Go to GharSeva
            </Link>
          </>
        )}
        {state === "error" && (
          <>
            <XCircle className="mx-auto text-red-500" size={48} />
            <h1 className="mt-4 text-xl font-bold text-slate-900">Couldn&apos;t verify</h1>
            <p className="mt-1 text-slate-500">{msg}</p>
            <Link href="/" className="btn-outline mt-6">
              Back home
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
