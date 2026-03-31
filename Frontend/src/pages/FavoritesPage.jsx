import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, formatApiError } from "../api/client";

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadFavorites() {
      try {
        const { data } = await api.get("/api/favorites");
        setFavorites(data);
      } catch (err) {
        setError(formatApiError(err, "Could not load favorites"));
      }
    }
    loadFavorites();
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">My Favorites</h1>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="grid gap-3 md:grid-cols-2">
        {favorites.map(f => (
          <div key={f._id} className="rounded-xl border border-slate-200 bg-white p-4">
            <h3 className="font-semibold">{f.vehicle_id?.name}</h3>
            <p className="text-sm text-slate-600">{f.vehicle_id?.brand}</p>
            <Link
              to={`/vehicles/${f.vehicle_id?._id}`}
              className="mt-2 inline-block text-sm text-brand-700 hover:underline"
            >
              View Details
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
