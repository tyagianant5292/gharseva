import { Suspense } from "react";
import RegisterForm from "@/components/RegisterForm";

export const metadata = { title: "Register — GharSeva" };

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="container-x py-10 text-slate-500">Loading…</div>}>
      <RegisterForm />
    </Suspense>
  );
}
