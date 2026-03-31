import { useEffect, useState } from "react";
import { api, formatApiError } from "../api/client";

export default function AdminDashboardPage() {
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState("");
  const [notification, setNotification] = useState({ title: "", message: "" });

  async function loadAdminData() {
    setError("");
    try {
      const [a, u, l] = await Promise.all([
        api.get("/api/admin/analytics"),
        api.get("/api/admin/users"),
        api.get("/api/admin/logs")
      ]);
      setAnalytics(a.data);
      setUsers(u.data);
      setLogs(l.data);
    } catch (err) {
      setError(formatApiError(err, "Admin data load failed"));
    }
  }

  useEffect(() => {
    loadAdminData();
  }, []);

  async function blockUser(userId) {
    try {
      await api.put(`/api/admin/block/${userId}`);
      await loadAdminData();
    } catch (err) {
      setError(formatApiError(err, "Block user failed"));
    }
  }

  async function postNotification(e) {
    e.preventDefault();
    try {
      await api.post("/api/notifications", notification);
      setNotification({ title: "", message: "" });
      await loadAdminData();
    } catch (err) {
      setError(formatApiError(err, "Create notification failed"));
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
      {error && <p className="text-sm text-red-600">{error}</p>}

      <section className="grid gap-3 md:grid-cols-3 lg:grid-cols-5">
        {analytics &&
          Object.entries(analytics).map(([key, value]) => (
            <div key={key} className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs uppercase text-slate-500">{key}</p>
              <p className="text-xl font-bold text-slate-900">{value}</p>
            </div>
          ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="mb-3 text-lg font-semibold">Users</h2>
          <ul className="space-y-2 text-sm">
            {users.map(user => (
              <li key={user._id} className="flex items-center justify-between rounded-md bg-slate-50 p-2">
                <span>
                  {user.name} ({user.role}) {user.isBlocked ? "- blocked" : ""}
                </span>
                {user.role !== "admin" && !user.isBlocked && (
                  <button
                    onClick={() => blockUser(user._id)}
                    className="rounded bg-rose-600 px-3 py-1 text-xs text-white"
                  >
                    Block
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>

        <form onSubmit={postNotification} className="rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="mb-3 text-lg font-semibold">Post Notification</h2>
          <input
            placeholder="Title"
            value={notification.title}
            onChange={e => setNotification(prev => ({ ...prev, title: e.target.value }))}
            className="mb-2 w-full rounded-md border border-slate-300 p-2 text-sm"
          />
          <textarea
            rows={3}
            placeholder="Message"
            value={notification.message}
            onChange={e => setNotification(prev => ({ ...prev, message: e.target.value }))}
            className="w-full rounded-md border border-slate-300 p-2 text-sm"
          />
          <button className="mt-3 rounded-md bg-brand-600 px-4 py-2 text-sm text-white">
            Publish
          </button>
        </form>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="mb-3 text-lg font-semibold">Admin Logs</h2>
        <ul className="space-y-2 text-sm">
          {logs.map(log => (
            <li key={log._id} className="rounded-md bg-slate-50 p-2">
              {log.action}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
