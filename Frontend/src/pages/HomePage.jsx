import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, formatApiError } from "../api/client";
import { useAuth } from "../state/AuthContext";
import VehicleCard from "../components/VehicleCard";

const initialFilters = {
  brand: "",
  fuel_type: "",
  transmission: "",
  minPrice: "",
  maxPrice: "",
  minMileage: "",
  maxMileage: "",
  q: ""
};

export default function HomePage() {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const [filters, setFilters] = useState(initialFilters);
  const [vehicles, setVehicles] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function fetchVehicles() {
    setLoading(true);
    setError("");
    try {
      const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== ""));
      const { data } = await api.get("/api/vehicles", { params });
      setVehicles(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      setError(formatApiError(err, "Failed to load vehicles"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchVehicles();
  }, []);

  function toggleCompare(vehicleId) {
    setSelected(prev => {
      if (prev.includes(vehicleId)) return prev.filter(id => id !== vehicleId);
      if (prev.length >= 3) return prev;
      return [...prev, vehicleId];
    });
  }

  async function addFavorite(vehicleId) {
    if (!isLoggedIn) return navigate("/login");
    try {
      await api.post("/api/favorites", { vehicle_id: vehicleId });
      setMessage("Added to favorites");
      setTimeout(() => setMessage(""), 1800);
    } catch (err) {
      setError(formatApiError(err, "Could not save favorite"));
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl bg-gradient-to-r from-brand-700 to-brand-500 p-6 text-white">
        <h1 className="text-2xl font-bold md:text-3xl">Smart Car Comparison & Recommendations</h1>
        <p className="mt-2 text-brand-50">
          Filter, compare 2-3 vehicles, view deep specs, and save favorites.
        </p>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="grid gap-3 md:grid-cols-4">
          {Object.keys(initialFilters).map(key => (
            <input
              key={key}
              value={filters[key]}
              onChange={e => setFilters(prev => ({ ...prev, [key]: e.target.value }))}
              placeholder={key}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
            />
          ))}
        </div>
        <div className="mt-3 flex gap-2">
          <button
            onClick={fetchVehicles}
            className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            Apply Filters
          </button>
          <button
            onClick={() => {
              setFilters(initialFilters);
              setTimeout(fetchVehicles, 0);
            }}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm hover:bg-slate-100"
          >
            Reset
          </button>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Compare Selection ({selected.length}/3)</h2>
          <button
            disabled={selected.length < 2}
            onClick={() => navigate("/compare", { state: { selected } })}
            className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            Compare Now
          </button>
        </div>
        <p className="text-xs text-slate-500">Select at least 2 and at most 3 vehicles.</p>
      </section>

      {message && <p className="text-sm text-emerald-600">{message}</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {loading ? (
        <p>Loading vehicles...</p>
      ) : (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {vehicles.map(vehicle => (
            <VehicleCard
              key={vehicle._id}
              vehicle={vehicle}
              selected={selected.includes(vehicle._id)}
              onCompareToggle={toggleCompare}
              onFavorite={addFavorite}
            />
          ))}
        </section>
      )}
    </div>
  );
}
