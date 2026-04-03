import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, formatApiError } from "../api/client";
import { useToast } from "../components/Toast";

const PH = "https://placehold.co/400x220/e2e8f0/94a3b8?text=No+Image";

export default function FavoritesPage() {
  const toast = useToast();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const { data } = await api.get("/api/favorites");
      setFavorites(Array.isArray(data) ? data : []);
    } catch (err) {
      toast(formatApiError(err, "Could not load favorites"), "error");
    } finally {
      setLoading(false);
    }
  }

  async function remove(id) {
    try {
      await api.delete(`/api/favorites/${id}`);
      toast("Removed from favorites");
      setFavorites((p) => p.filter((f) => f._id !== id));
    } catch (err) {
      toast(formatApiError(err, "Could not remove"), "error");
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900">My Favorites</h1>
          <p className="section-sub">Vehicles you've saved for later</p>
        </div>
        {favorites.length > 0 && (
          <span className="badge-brand text-sm px-3 py-1">
            {favorites.length} saved
          </span>
        )}
      </div>

      {loading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-72 skeleton" />
          ))}
        </div>
      ) : favorites.length === 0 ? (
        <div className="card flex flex-col items-center gap-4 py-24 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-amber-50 text-4xl">
            ♥
          </div>
          <div>
            <p className="font-bold text-slate-800 text-lg">No favorites yet</p>
            <p className="text-sm text-slate-400 mt-1">
              Browse vehicles and save the ones you love
            </p>
          </div>
          <Link to="/" className="btn-primary mt-2">
            Browse Vehicles →
          </Link>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {favorites.map((f, i) => {
            const v = f.vehicle_id;
            if (!v) return null;
            return (
              <div
                key={f._id}
                className="card-hover overflow-hidden animate-fade-in"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className="relative h-44 overflow-hidden bg-surface-100">
                  <img
                    src={v.images?.[0] || PH}
                    alt={v.name}
                    className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                    onError={(e) => {
                      e.target.src = PH;
                    }}
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent p-3">
                    <p className="font-bold text-white text-sm">{v.name}</p>
                    <p className="text-xs text-white/70">{v.brand}</p>
                  </div>
                  <div className="absolute right-3 top-3">
                    <span className="badge bg-white/90 text-slate-700 shadow-sm">
                      {v.fuel_type}
                    </span>
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded-lg bg-surface-50 px-3 py-2">
                      <p className="text-slate-400">Price</p>
                      <p className="font-bold text-brand-600">
                        Rs. {v.price?.toLocaleString()}
                      </p>
                    </div>
                    <div className="rounded-lg bg-surface-50 px-3 py-2">
                      <p className="text-slate-400">Mileage</p>
                      <p className="font-bold text-slate-800">
                        {v.mileage} km/l
                      </p>
                    </div>
                    <div className="rounded-lg bg-surface-50 px-3 py-2">
                      <p className="text-slate-400">Engine</p>
                      <p className="font-bold text-slate-800 truncate">
                        {v.engine || "N/A"}
                      </p>
                    </div>
                    <div className="rounded-lg bg-surface-50 px-3 py-2">
                      <p className="text-slate-400">Trans.</p>
                      <p className="font-bold text-slate-800">
                        {v.transmission || "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Link
                      to={`/vehicles/${v._id}`}
                      className="btn-secondary btn-sm flex-1 text-center"
                    >
                      View Details
                    </Link>
                    <button
                      onClick={() => remove(f._id)}
                      className="btn-sm rounded-xl border border-rose-200 bg-rose-50 px-3 text-rose-600 hover:bg-rose-100 transition"
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
