import { Suspense } from "react";
import LoginForm from "@/components/LoginForm";

export const metadata = { title: "Login — GharSeva" };

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="container-x py-10 text-slate-500">Loading…</div>}>
      <LoginForm />
    </Suspense>
  );
}
