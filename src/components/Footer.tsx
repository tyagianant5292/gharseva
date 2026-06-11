import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="container-x flex flex-col items-center justify-between gap-3 py-8 text-sm text-slate-500 sm:flex-row">
        <p>
          © {new Date().getFullYear()} <span className="font-semibold text-slate-700">GharSeva</span> — trusted home helpers near you.
        </p>
        <div className="flex items-center gap-4">
          <Link href="/providers" className="hover:text-brand-600">
            Find Helpers
          </Link>
          <Link href="/register?role=PROVIDER" className="hover:text-brand-600">
            Become a Helper
          </Link>
        </div>
      </div>
    </footer>
  );
}
