import { useEffect, useState } from "react";
import { api, formatApiError } from "../api/client";
import { useToast } from "../components/Toast";

function timeAgo(d) {
  if (!d) return "";
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(d).toLocaleDateString();
}

export default function NotificationsPage() {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const { data } = await api.get("/api/notifications");
        setItems(Array.isArray(data) ? data : []);
      } catch (err) {
        toast(formatApiError(err, "Failed to load notifications"), "error");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-black text-slate-900">Notifications</h1>
        <p className="section-sub">
          Latest updates and announcements from VehicleVault
        </p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 skeleton" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="card flex flex-col items-center gap-4 py-24 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-50 text-4xl">
            🔔
          </div>
          <div>
            <p className="font-bold text-slate-800 text-lg">All caught up!</p>
            <p className="text-sm text-slate-400 mt-1">
              No notifications right now. Check back later.
            </p>
          </div>
        </div>
      ) : (
        <ul className="space-y-3">
          {items.map((item, i) => (
            <li
              key={item._id}
              className="card-hover flex items-start gap-4 p-5 animate-slide-up"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-brand-100 text-xl shadow-sm">
                🔔
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-bold text-slate-900 leading-snug">
                    {item.title}
                  </h3>
                  <span className="flex-shrink-0 rounded-full bg-surface-100 px-2.5 py-1 text-xs text-slate-400">
                    {timeAgo(item.created_at)}
                  </span>
                </div>
                <p className="mt-1.5 text-sm text-slate-600 leading-relaxed">
                  {item.message}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
