import { Link, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../state/AuthContext";

const navItems = [
  { to: "/", label: "Vehicles" },
  { to: "/compare", label: "Compare" },
  { to: "/favorites", label: "Favorites" },
  { to: "/notifications", label: "Notifications" }
];

export default function AppLayout() {
  const { isLoggedIn, isAdmin, auth, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="container-shell flex items-center justify-between py-4">
          <Link to="/" className="text-xl font-bold text-brand-700">
            Vehicle Vault
          </Link>
          <nav className="hidden gap-4 md:flex">
            {navItems.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `rounded-md px-3 py-2 text-sm font-medium ${
                    isActive ? "bg-brand-100 text-brand-700" : "text-slate-600 hover:bg-slate-100"
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
                  `rounded-md px-3 py-2 text-sm font-medium ${
                    isActive ? "bg-brand-100 text-brand-700" : "text-slate-600 hover:bg-slate-100"
                  }`
                }
              >
                Admin
              </NavLink>
            )}
          </nav>
          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <>
                <span className="hidden text-sm text-slate-600 sm:inline">{auth?.name}</span>
                <button
                  onClick={logout}
                  className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-700"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm text-slate-700 hover:text-brand-700">
                  Login
                </Link>
                <Link
                  to="/register"
                  className="rounded-md bg-brand-600 px-4 py-2 text-sm text-white hover:bg-brand-700"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </header>
      <main className="container-shell py-6">
        <Outlet />
      </main>
    </div>
  );
}
