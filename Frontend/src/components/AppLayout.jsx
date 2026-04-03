import { useState, useEffect } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../state/AuthContext";

const NAV = [
  { to: "/", label: "Vehicles", exact: true, icon: "🚗" },
  { to: "/compare", label: "Compare", icon: "⚖️" },
  { to: "/favorites", label: "Favorites", icon: "♥" },
  { to: "/notifications", label: "Updates", icon: "🔔" },
];

export default function AppLayout() {
  const { isLoggedIn, isAdmin, auth, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const linkCls = ({ isActive }) =>
    `relative flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-medium transition-all duration-150 ${
      isActive
        ? "bg-brand-600 text-white shadow-sm"
        : "text-slate-600 hover:bg-surface-100 hover:text-slate-900"
    }`;

  return (
    <div className="flex min-h-screen flex-col bg-surface-50">
      {/* ── Navbar ── */}
      <header
        className={`sticky top-0 z-50 transition-all duration-200 ${
          scrolled
            ? "border-b border-surface-200 bg-white/95 shadow-card backdrop-blur-md"
            : "border-b border-transparent bg-white/80 backdrop-blur-sm"
        }`}
      >
        <div className="shell flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-gradient shadow-sm">
              <span className="text-sm font-black text-white tracking-tight">
                VV
              </span>
            </div>
            <div className="hidden sm:block">
              <span className="text-lg font-black text-slate-900 leading-none">
                Vehicle<span className="text-brand-600">Vault</span>
              </span>
              <p className="text-[10px] text-slate-400 leading-none mt-0.5">
                Smart Car Comparison
              </p>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 md:flex">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.exact}
                className={linkCls}
              >
                <span className="text-base leading-none">{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
            {isAdmin && (
              <NavLink to="/admin" className={linkCls}>
                <span className="text-base leading-none">⚙️</span>
                Admin
              </NavLink>
            )}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {isLoggedIn ? (
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-2 rounded-xl border border-surface-200 bg-surface-50 px-3 py-1.5">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
                    {auth?.name?.[0]?.toUpperCase() || "U"}
                  </div>
                  <span className="text-sm font-medium text-slate-700 max-w-[100px] truncate">
                    {auth?.name}
                  </span>
                  {isAdmin && (
                    <span className="badge-brand text-[10px]">Admin</span>
                  )}
                </div>
                <button
                  onClick={logout}
                  className="btn-secondary btn-sm hidden sm:flex"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link to="/login" className="btn-ghost btn-sm">
                  Sign in
                </Link>
                <Link to="/register" className="btn-primary btn-sm">
                  Get started
                </Link>
              </div>
            )}

            {/* Mobile toggle */}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="btn-icon btn-secondary md:hidden"
              aria-label="Toggle menu"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {mobileOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="border-t border-surface-200 bg-white px-4 pb-4 pt-3 md:hidden animate-slide-down">
            <nav className="flex flex-col gap-1">
              {NAV.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.exact}
                  className={linkCls}
                >
                  <span>{item.icon}</span> {item.label}
                </NavLink>
              ))}
              {isAdmin && (
                <NavLink to="/admin" className={linkCls}>
                  <span>⚙️</span> Admin Dashboard
                </NavLink>
              )}
            </nav>
            <div className="mt-3 divider pt-3 flex gap-2">
              {isLoggedIn ? (
                <button
                  onClick={logout}
                  className="btn-secondary btn-sm w-full"
                >
                  Sign out ({auth?.name})
                </button>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="btn-secondary btn-sm flex-1 text-center"
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/register"
                    className="btn-primary btn-sm flex-1 text-center"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* ── Page content ── */}
      <main className="shell flex-1 py-8">
        <Outlet />
      </main>

      {/* ── Footer ── */}
      <footer className="mt-auto border-t border-surface-200 bg-white">
        <div className="shell py-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-gradient">
                <span className="text-xs font-black text-white">VV</span>
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">VehicleVault</p>
                <p className="text-xs text-slate-400">
                  Smart Car Comparison Platform
                </p>
              </div>
            </div>
            <div className="flex items-center gap-6 text-xs text-slate-400">
              <span>Compare · Discover · Decide</span>
              <span>© {new Date().getFullYear()} VehicleVault</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
