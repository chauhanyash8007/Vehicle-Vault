import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { formatApiError } from "../api/client";
import { useAuth } from "../state/AuthContext";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    try {
      await login(form);
      navigate("/");
    } catch (err) {
      setError(formatApiError(err, "Login failed"));
    }
  }

  return (
    <div className="mx-auto max-w-md rounded-xl border border-slate-200 bg-white p-6">
      <h1 className="mb-4 text-2xl font-bold">Login</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))}
          className="w-full rounded-md border border-slate-300 p-2 text-sm"
        />
        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={e => setForm(prev => ({ ...prev, password: e.target.value }))}
          className="w-full rounded-md border border-slate-300 p-2 text-sm"
        />
        <button className="w-full rounded-md bg-brand-600 px-4 py-2 text-white">Login</button>
      </form>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      <p className="mt-4 text-sm">
        No account?{" "}
        <Link to="/register" className="text-brand-700 hover:underline">
          Register
        </Link>
      </p>
    </div>
  );
}
