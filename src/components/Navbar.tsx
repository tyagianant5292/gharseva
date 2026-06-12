import Link from "next/link";
import { Home, Zap } from "lucide-react";
import { getSessionUser } from "@/lib/auth";
import { isAdmin } from "@/lib/admin";
import LogoutButton from "./LogoutButton";

export default async function Navbar() {
  const user = await getSessionUser();
  const admin = isAdmin(user);

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
          <Link href="/instant" className="flex items-center gap-1 text-sm font-medium text-amber-600 hover:text-amber-700">
            <Zap size={14} className="fill-amber-500 text-amber-500" /> Instant
          </Link>
          {user ? (
            <>
              {admin && (
                <Link href="/admin" className="text-sm font-semibold text-brand-600 hover:text-brand-700">
                  Admin
                </Link>
              )}
              <Link href="/requests" className="hidden text-sm font-medium text-slate-600 hover:text-brand-600 sm:block">
                My Requests
              </Link>
              {user.role === "PROVIDER" && (
                <Link href="/dashboard" className="text-sm font-medium text-slate-600 hover:text-brand-600">
                  My Profile
                </Link>
              )}
              <span className="hidden text-sm text-slate-400 sm:block">·</span>
              <Link
                href="/account"
                title="My account"
                className="hidden max-w-[120px] truncate text-sm font-medium text-slate-700 hover:text-brand-600 sm:block"
              >
                {user.name}
              </Link>
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
