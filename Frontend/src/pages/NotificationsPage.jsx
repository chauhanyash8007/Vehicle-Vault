import { useEffect, useState } from "react";
import { api, formatApiError } from "../api/client";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const { data } = await api.get("/api/notifications");
        setNotifications(data);
      } catch (err) {
        setError(formatApiError(err, "Failed to fetch notifications"));
      }
    }
    load();
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <ul className="space-y-3">
        {notifications.map(item => (
          <li key={item._id} className="rounded-xl border border-slate-200 bg-white p-4">
            <h3 className="font-semibold text-slate-900">{item.title}</h3>
            <p className="text-sm text-slate-700">{item.message}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
