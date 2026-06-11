import Link from "next/link";
import { Home } from "lucide-react";
import { getSessionUser } from "@/lib/auth";
import LogoutButton from "./LogoutButton";

export default async function Navbar() {
  const user = await getSessionUser();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur">
      <nav className="container-x flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-extrabold text-slate-900">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600 text-white">
            <Home size={18} />
          </span>
          <span className="text-lg">
            Ghar<span className="text-brand-600">Seva</span>
          </span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link href="/providers" className="hidden text-sm font-medium text-slate-600 hover:text-brand-600 sm:block">
            Find Helpers
          </Link>
          {user ? (
            <>
              {user.role === "PROVIDER" && (
                <Link href="/dashboard" className="text-sm font-medium text-slate-600 hover:text-brand-600">
                  My Profile
                </Link>
              )}
              <span className="hidden text-sm text-slate-400 sm:block">·</span>
              <span className="hidden max-w-[120px] truncate text-sm font-medium text-slate-700 sm:block">
                {user.name}
              </span>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link href="/login" className="btn-outline">
                Login
              </Link>
              <Link href="/register" className="btn-primary">
                Register
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
