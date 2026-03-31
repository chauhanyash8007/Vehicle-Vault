import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { formatApiError } from "../api/client";
import { useAuth } from "../state/AuthContext";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    try {
      await register(form);
      navigate("/");
    } catch (err) {
      setError(formatApiError(err, "Registration failed"));
    }
  }

  return (
    <div className="mx-auto max-w-md rounded-xl border border-slate-200 bg-white p-6">
      <h1 className="mb-4 text-2xl font-bold">Create Account</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <input
          placeholder="Full name"
          value={form.name}
          onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
          className="w-full rounded-md border border-slate-300 p-2 text-sm"
        />
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
        <button className="w-full rounded-md bg-brand-600 px-4 py-2 text-white">Register</button>
      </form>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      <p className="mt-4 text-sm">
        Already have account?{" "}
        <Link to="/login" className="text-brand-700 hover:underline">
          Login
        </Link>
      </p>
    </div>
  );
}
