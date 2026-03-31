import { Link, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../state/AuthContext";

const navItems = [
  { to: "/", label: "Vehicles" },
  { to: "/compare", label: "Compare" },
  { to: "/favorites", label: "Favorites" },
  { to: "/notifications", label: "Notifications" },
];

export default function AppLayout() {
  const { isLoggedIn, isAdmin, auth, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white shadow-sm">
        <div className="container-shell flex items-center justify-between py-4">
          <Link
            to="/"
            className="text-xl font-black text-brand-700 md:text-2xl"
          >
            Vehicle Vault
          </Link>

          <nav className="hidden items-center gap-3 md:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2 text-sm font-medium ${
                    isActive
                      ? "bg-brand-100 text-brand-700"
                      : "text-slate-600 hover:bg-slate-100"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
            {isAdmin && (
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2 text-sm font-medium ${
                    isActive
                      ? "bg-brand-100 text-brand-700"
                      : "text-slate-600 hover:bg-slate-100"
                  }`
                }
              >
                Admin
              </NavLink>
            )}
          </nav>

          <div className="flex items-center gap-2">
            {isLoggedIn ? (
              <>
                <span className="hidden text-sm text-slate-600 sm:inline">
                  Welcome, {auth?.name}
                </span>
                <button
                  onClick={logout}
                  className="rounded-lg bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-700"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:text-brand-700"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>

        <div className="border-t border-slate-200 bg-slate-50 p-2 text-center text-xs text-slate-500 md:hidden">
          Use the desktop mode for full admin controls.
        </div>
      </header>

      <main className="container-shell py-6">
        <Outlet />
      </main>

      <footer className="border-t border-slate-200 bg-white py-6">
        <div className="container-shell text-center text-sm text-slate-500">
          Vehicle Vault © {new Date().getFullYear()} | Built with MERN and
          Tailwind CSS
        </div>
      </footer>
    </div>
  );
}
