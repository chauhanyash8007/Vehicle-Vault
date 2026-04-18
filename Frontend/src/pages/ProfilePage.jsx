import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, formatApiError } from "../api/client";
import { useAuth } from "../state/AuthContext";
import { useToast } from "../components/Toast";

const AVATAR_COLORS = ["bg-brand-600","bg-violet-600","bg-emerald-600","bg-amber-500","bg-rose-600","bg-teal-600","bg-indigo-600","bg-pink-600"];
function avatarColor(name) { return AVATAR_COLORS[(name?.charCodeAt(0) || 0) % AVATAR_COLORS.length]; }

const PH = "https://placehold.co/64x40/e2e8f0/94a3b8?text=VV";

function Stars({ value }) {
  return <span className="text-amber-400 text-xs">{"★".repeat(value)}{"☆".repeat(5 - value)}</span>;
}

function StatCard({ icon, label, value, to, color = "text-brand-600" }) {
  const inner = (
    <div className={`stat-card group transition-all hover:shadow-card-md ${to ? "cursor-pointer" : ""}`}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</p>
        <span className="text-xl">{icon}</span>
      </div>
      <p className={`text-3xl font-black ${color}`}>{value}</p>
      {to && <p className="text-xs text-brand-500 group-hover:underline mt-0.5">View all →</p>}
    </div>
  );
  return to ? <Link to={to}>{inner}</Link> : inner;
}

const TABS = [
  { id: "info",     label: "Personal Info",   icon: "👤" },
  { id: "activity", label: "My Activity",     icon: "📊" },
  { id: "password", label: "Change Password", icon: "🔒" },
  { id: "danger",   label: "Account",         icon: "⚠️" },
];

export default function ProfilePage() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState("info");

  const [name, setName] = useState("");
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [deletePw, setDeletePw] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const pwStrength = newPw.length === 0 ? 0 : newPw.length < 6 ? 1 : newPw.length < 10 ? 2 : 3;
  const pwColors = ["", "bg-rose-500", "bg-amber-500", "bg-emerald-500"];
  const pwLabels = ["", "Weak", "Good", "Strong"];

  async function loadProfile() {
    setLoading(true);
    try {
      const { data } = await api.get("/api/auth/profile");
      setProfile(data);
      setName(data.name || "");
    } catch (err) {
      toast(formatApiError(err, "Failed to load profile"), "error");
    } finally { setLoading(false); }
  }

  useEffect(() => { loadProfile(); }, []);

  async function saveInfo(e) {
    e.preventDefault();
    if (!name.trim()) return toast("Name cannot be empty", "warning");
    setSaving(true);
    try {
      const { data } = await api.put("/api/auth/profile", { name });
      const stored = JSON.parse(localStorage.getItem("vehicle_vault_auth") || "{}");
      localStorage.setItem("vehicle_vault_auth", JSON.stringify({ ...stored, name: data.name, token: data.token }));
      window.dispatchEvent(new Event("storage"));
      toast("Name updated!");
      await loadProfile();
    } catch (err) { toast(formatApiError(err, "Update failed"), "error"); }
    finally { setSaving(false); }
  }

  async function savePassword(e) {
    e.preventDefault();
    if (newPw.length < 6) return toast("New password must be at least 6 characters", "warning");
    if (newPw !== confirmPw) return toast("Passwords do not match", "warning");
    setSaving(true);
    try {
      await api.put("/api/auth/profile", { currentPassword: currentPw, newPassword: newPw });
      toast("Password changed! Signing you out...");
      setCurrentPw(""); setNewPw(""); setConfirmPw("");
      setTimeout(() => { logout(); navigate("/login"); }, 1500);
    } catch (err) { toast(formatApiError(err, "Password change failed"), "error"); }
    finally { setSaving(false); }
  }

  async function deleteAccount(e) {
    e.preventDefault();
    if (!deletePw) return toast("Enter your password to confirm", "warning");
    setSaving(true);
    try {
      await api.delete("/api/auth/profile", { data: { password: deletePw } });
      toast("Account deleted. Goodbye!", "info");
      setTimeout(() => { logout(); navigate("/"); }, 1500);
    } catch (err) { toast(formatApiError(err, "Deletion failed"), "error"); }
    finally { setSaving(false); }
  }

  if (loading) return (
    <div className="space-y-5 animate-pulse">
      <div className="h-36 skeleton rounded-3xl" />
      <div className="grid gap-4 sm:grid-cols-3">{[1,2,3].map(i => <div key={i} className="h-24 skeleton" />)}</div>
      <div className="h-72 skeleton" />
    </div>
  );

  const joinDate = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long" })
    : "N/A";

  return (
    <div className="space-y-6 animate-fade-in">

      {/* ── Hero ── */}
      <div className="relative overflow-hidden rounded-3xl bg-hero px-6 py-8 text-white shadow-card-lg">
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/5 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-8 left-1/4 h-48 w-48 rounded-full bg-violet-500/20 blur-3xl" />
        <div className="relative z-10 flex flex-wrap items-center gap-5">
          <div className={`flex h-20 w-20 items-center justify-center rounded-2xl text-4xl font-black text-white shadow-card border border-white/20 ${avatarColor(profile?.name)}`}>
            {profile?.name?.[0]?.toUpperCase() || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-black text-white">{profile?.name}</h1>
              {profile?.role === "admin" && (
                <span className="rounded-full border border-amber-400/40 bg-amber-400/20 px-2.5 py-0.5 text-xs font-bold text-amber-300">Admin</span>
              )}
            </div>
            <p className="mt-0.5 text-sm text-white/60">{profile?.email}</p>
            <p className="mt-1 text-xs text-white/40">Member since {joinDate}</p>
          </div>
          <button onClick={() => { logout(); navigate("/login"); }}
            className="rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white/80 hover:bg-white/20 transition backdrop-blur">
            Sign Out
          </button>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon="⚖️" label="Comparisons" value={profile?.stats?.comparisons ?? 0} color="text-violet-600" />
        <StatCard icon="♥" label="Favorites" value={profile?.stats?.favorites ?? 0} to="/favorites" color="text-rose-500" />
        <StatCard icon="⭐" label="Reviews" value={profile?.stats?.reviews ?? 0} color="text-amber-500" />
      </div>

      {/* ── Tabs ── */}
      <div className="card overflow-hidden">
        <div className="flex overflow-x-auto border-b border-surface-200 bg-surface-50 no-scrollbar">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex flex-shrink-0 items-center gap-1.5 px-5 py-3.5 text-sm font-medium transition border-b-2 ${
                tab === t.id ? "border-brand-600 text-brand-700 bg-white" : "border-transparent text-slate-500 hover:text-slate-700"
              }`}>
              <span>{t.icon}</span>{t.label}
            </button>
          ))}
        </div>

        <div className="p-6">

          {/* ── Personal Info ── */}
          {tab === "info" && (
            <form onSubmit={saveInfo} className="space-y-5 max-w-md">
              <div>
                <label className="label">Full Name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} className="input" placeholder="Your full name" required />
              </div>
              <div>
                <label className="label">Email Address</label>
                <input value={profile?.email || ""} disabled className="input bg-surface-50 text-slate-400 cursor-not-allowed" />
                <p className="mt-1 text-xs text-slate-400">Email cannot be changed</p>
              </div>
              <div>
                <label className="label">Account Role</label>
                <div className="flex items-center gap-2 rounded-xl border border-surface-200 bg-surface-50 px-4 py-2.5">
                  <span className={`badge ${profile?.role === "admin" ? "badge-brand" : "badge-slate"}`}>{profile?.role}</span>
                </div>
              </div>
              <button type="submit" disabled={saving || name === profile?.name} className="btn-primary disabled:opacity-50">
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </form>
          )}

          {/* ── Activity ── */}
          {tab === "activity" && (
            <div className="space-y-6">
              {/* Recent Favorites */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-slate-900">Recent Favorites</h3>
                  <Link to="/favorites" className="text-xs text-brand-600 hover:underline">View all →</Link>
                </div>
                {profile?.recentFavorites?.length === 0 ? (
                  <p className="text-sm text-slate-400 py-4 text-center">No favorites yet. <Link to="/vehicles" className="text-brand-600 hover:underline">Browse vehicles →</Link></p>
                ) : (
                  <div className="grid gap-2 sm:grid-cols-2">
                    {profile?.recentFavorites?.map(f => {
                      const v = f.vehicle_id;
                      if (!v) return null;
                      return (
                        <Link key={f._id} to={`/vehicles/${v._id}`}
                          className="flex items-center gap-3 rounded-xl border border-surface-200 p-3 hover:border-brand-200 hover:bg-brand-50 transition group">
                          <div className="h-10 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-surface-100">
                            <img src={v.images?.[0] || PH} alt={v.name} className="h-full w-full object-cover" onError={(e) => { e.target.src = PH; }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-800 group-hover:text-brand-600 transition truncate">{v.name}</p>
                            <p className="text-xs text-slate-400">{v.brand} · Rs. {v.price?.toLocaleString()}</p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Recent Reviews */}
              <div>
                <h3 className="mb-3 font-bold text-slate-900">Recent Reviews</h3>
                {profile?.recentReviews?.length === 0 ? (
                  <p className="text-sm text-slate-400 py-4 text-center">No reviews yet.</p>
                ) : (
                  <div className="space-y-2">
                    {profile?.recentReviews?.map(r => {
                      const v = r.vehicle_id;
                      return (
                        <div key={r._id} className="flex items-start gap-3 rounded-xl border border-surface-200 p-3">
                          <div className="h-10 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-surface-100">
                            <img src={v?.images?.[0] || PH} alt={v?.name} className="h-full w-full object-cover" onError={(e) => { e.target.src = PH; }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-sm font-semibold text-slate-800 truncate">{v?.name || "Unknown Vehicle"}</p>
                              <Stars value={r.rating} />
                            </div>
                            {r.comment && <p className="mt-0.5 text-xs text-slate-500 line-clamp-2">{r.comment}</p>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Recent Comparisons */}
              <div>
                <h3 className="mb-3 font-bold text-slate-900">Recent Comparisons</h3>
                {profile?.recentComparisons?.length === 0 ? (
                  <p className="text-sm text-slate-400 py-4 text-center">No comparisons yet. <Link to="/compare" className="text-brand-600 hover:underline">Compare vehicles →</Link></p>
                ) : (
                  <div className="space-y-2">
                    {profile?.recentComparisons?.map(c => (
                      <div key={c._id} className="rounded-xl border border-surface-200 p-3">
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Compared</p>
                        <div className="flex flex-wrap gap-2">
                          {c.vehicles?.map(v => (
                            <Link key={v._id} to={`/vehicles/${v._id}`}
                              className="flex items-center gap-2 rounded-lg border border-surface-200 bg-surface-50 px-2.5 py-1.5 hover:border-brand-200 hover:bg-brand-50 transition">
                              <div className="h-6 w-8 overflow-hidden rounded bg-surface-100">
                                <img src={v.images?.[0] || PH} alt={v.name} className="h-full w-full object-cover" onError={(e) => { e.target.src = PH; }} />
                              </div>
                              <span className="text-xs font-medium text-slate-700">{v.name}</span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Change Password ── */}
          {tab === "password" && (
            <form onSubmit={savePassword} className="space-y-5 max-w-md">
              <div className="alert-warning">After changing your password you will be signed out automatically.</div>
              <div>
                <label className="label">Current Password</label>
                <input type="password" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} className="input" placeholder="Enter current password" required />
              </div>
              <div>
                <label className="label">New Password</label>
                <input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} className="input" placeholder="Min. 6 characters" required minLength={6} />
                {newPw.length > 0 && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex flex-1 gap-1">
                      {[1,2,3].map(i => <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= pwStrength ? pwColors[pwStrength] : "bg-surface-200"}`} />)}
                    </div>
                    <span className="text-xs text-slate-500">{pwLabels[pwStrength]}</span>
                  </div>
                )}
              </div>
              <div>
                <label className="label">Confirm New Password</label>
                <input type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)}
                  className={`input ${confirmPw && newPw !== confirmPw ? "border-rose-400" : ""}`}
                  placeholder="Re-enter new password" required />
                {confirmPw && newPw !== confirmPw && <p className="mt-1 text-xs text-rose-500">Passwords do not match</p>}
              </div>
              <button type="submit" disabled={saving || (confirmPw.length > 0 && newPw !== confirmPw)} className="btn-primary">
                {saving ? "Updating..." : "Change Password"}
              </button>
            </form>
          )}

          {/* ── Danger Zone ── */}
          {tab === "danger" && (
            <div className="space-y-6 max-w-md">
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5">
                <h3 className="font-bold text-rose-800 mb-1">Delete Account</h3>
                <p className="text-sm text-rose-700 mb-4">
                  This permanently deletes your account, all favorites, reviews, and comparison history. This action cannot be undone.
                </p>
                {!showDeleteConfirm ? (
                  <button onClick={() => setShowDeleteConfirm(true)} className="btn-danger btn-sm">
                    Delete My Account
                  </button>
                ) : (
                  <form onSubmit={deleteAccount} className="space-y-3">
                    <p className="text-sm font-semibold text-rose-800">Enter your password to confirm:</p>
                    <input type="password" value={deletePw} onChange={(e) => setDeletePw(e.target.value)}
                      className="input border-rose-300 focus:ring-rose-200" placeholder="Your password" required autoFocus />
                    <div className="flex gap-2">
                      <button type="submit" disabled={saving} className="btn-danger btn-sm">
                        {saving ? "Deleting..." : "Yes, Delete Everything"}
                      </button>
                      <button type="button" onClick={() => { setShowDeleteConfirm(false); setDeletePw(""); }} className="btn-secondary btn-sm">
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Quick links ── */}
      <div className="grid gap-3 sm:grid-cols-2">
        {[
          { to: "/favorites", icon: "♥", label: "My Favorites", desc: `${profile?.stats?.favorites ?? 0} saved vehicles`, color: "bg-rose-50" },
          { to: "/compare", icon: "⚖️", label: "Compare Vehicles", desc: "Start a new comparison", color: "bg-brand-50" },
          { to: "/vehicles", icon: "🚗", label: "Browse Vehicles", desc: "Explore the full catalog", color: "bg-emerald-50" },
          { to: "/notifications", icon: "🔔", label: "Notifications", desc: "Latest updates from admin", color: "bg-amber-50" },
        ].map(({ to, icon, label, desc, color }) => (
          <Link key={to} to={to} className="card-hover flex items-center gap-4 p-4">
            <div className={`flex h-11 w-11 items-center justify-center rounded-2xl text-2xl flex-shrink-0 ${color}`}>{icon}</div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-800">{label}</p>
              <p className="text-xs text-slate-400">{desc}</p>
            </div>
            <svg className="ml-auto h-4 w-4 text-slate-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        ))}
      </div>
    </div>
  );
}
