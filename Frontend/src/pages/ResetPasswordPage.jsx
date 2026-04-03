import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, formatApiError } from "../api/client";
import { useToast } from "../components/Toast";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const mismatch = confirm.length > 0 && password !== confirm;

  async function onSubmit(e) {
    e.preventDefault();
    if (password.length < 6)
      return toast("Password must be at least 6 characters", "warning");
    if (password !== confirm) return toast("Passwords do not match", "warning");
    setLoading(true);
    try {
      await api.post("/api/auth/reset-password-simple", { email, password });
      toast("Password updated! Please sign in.", "success");
      navigate("/login");
    } catch (err) {
      toast(formatApiError(err, "Reset failed"), "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-hero px-4 py-12">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-white/5 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md animate-fade-in">
        <div className="mb-8 text-center">
          <Link to="/" className="inline-flex flex-col items-center gap-3">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 backdrop-blur border border-white/20 shadow-card-lg">
              <span className="text-2xl font-black text-white">VV</span>
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">Reset Password</h1>
              <p className="mt-1 text-sm text-white/60">
                Enter your email and choose a new password
              </p>
            </div>
          </Link>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/10 p-8 backdrop-blur-xl shadow-card-lg">
          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <label className="label text-white/80">Email address</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-white/50 focus:ring-white/20"
                required
                autoFocus
              />
            </div>
            <div>
              <label className="label text-white/80">New Password</label>
              <input
                type="password"
                placeholder="Min. 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-white/50 focus:ring-white/20"
                required
                minLength={6}
              />
            </div>
            <div>
              <label className="label text-white/80">
                Confirm New Password
              </label>
              <input
                type="password"
                placeholder="Re-enter new password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="input bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-white/50 focus:ring-white/20"
                required
              />
              {mismatch && (
                <p className="mt-1 text-xs text-rose-300">
                  Passwords do not match
                </p>
              )}
            </div>
            <button
              type="submit"
              disabled={loading || mismatch}
              className="w-full rounded-xl bg-white py-3 text-sm font-bold text-brand-700 shadow-card-md transition hover:bg-brand-50 active:scale-[0.98] disabled:opacity-60"
            >
              {loading ? "Updating..." : "Reset Password"}
            </button>
          </form>
          <div className="mt-6 text-center text-sm text-white/50">
            <Link to="/login" className="hover:text-white transition">
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
