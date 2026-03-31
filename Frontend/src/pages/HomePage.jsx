import { useEffect, useMemo, useState } from "react";
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
  q: "",
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

  const vehicleCount = vehicles.length;
  const selectedCount = selected.length;

  async function fetchVehicles() {
    setLoading(true);
    setError("");
    try {
      const params = Object.fromEntries(
        Object.entries(filters).filter(([, v]) => v !== ""),
      );
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
    setSelected((prev) => {
      if (prev.includes(vehicleId))
        return prev.filter((id) => id !== vehicleId);
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

  const stats = useMemo(
    () => ({
      "Total Vehicles": vehicleCount,
      "Selected for Compare": selectedCount,
      "Favorite Vehicle": message ? 1 : 0,
    }),
    [vehicleCount, selectedCount, message],
  );

  return (
    <div className="space-y-8">
      <section className="rounded-3xl bg-gradient-to-r from-brand-700 via-brand-600 to-brand-500 p-8 text-white shadow-lg">
        <div className="mx-auto max-w-5xl space-y-4">
          <h1 className="text-3xl font-black md:text-5xl">Vehicle Vault</h1>
          <p className="text-lg text-brand-100 md:text-xl">
            Professional vehicle comparison and recommendation platform for
            smart buyers. Find the best cars, compare specs and pick with
            confidence.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => window.scrollTo({ top: 450, behavior: "smooth" })}
              className="rounded-lg bg-white px-6 py-3 font-semibold text-brand-700 transition hover:bg-slate-100"
            >
              Start Comparing
            </button>
            <button
              onClick={() => navigate("/notifications")}
              className="rounded-lg border border-white px-6 py-3 font-semibold text-white transition hover:bg-white/20"
            >
              Latest Notifications
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Object.entries(stats).map(([label, value]) => (
          <div
            key={label}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <p className="text-xs uppercase tracking-wider text-slate-500">
              {label}
            </p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">
              {value}
            </p>
          </div>
        ))}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-bold">Find the Right Vehicle</h2>
        <div className="grid gap-3 lg:grid-cols-4">
          {Object.keys(initialFilters).map((key) => (
            <input
              key={key}
              value={filters[key]}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, [key]: e.target.value }))
              }
              placeholder={
                key === "q"
                  ? "Search by name, brand, engine..."
                  : key === "minPrice"
                    ? "Min Price"
                    : key === "maxPrice"
                      ? "Max Price"
                      : key.charAt(0).toUpperCase() + key.slice(1)
              }
              className="rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
            />
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            onClick={fetchVehicles}
            className="rounded-xl bg-brand-600 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-700"
          >
            Apply Filters
          </button>
          <button
            onClick={() => {
              setFilters(initialFilters);
              setTimeout(fetchVehicles, 0);
            }}
            className="rounded-xl border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
          >
            Reset
          </button>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-bold">
            Select Vehicles for Comparison ({selectedCount}/3)
          </h2>
          <button
            disabled={selectedCount < 2}
            onClick={() => navigate("/compare", { state: { selected } })}
            className="rounded-xl bg-brand-600 px-5 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            Compare Now
          </button>
        </div>
        <p className="mb-3 text-sm text-slate-500">
          Select 2-3 vehicles to generate an intelligent comparison report.
        </p>

        {message && <p className="mb-2 text-sm text-emerald-600">{message}</p>}
        {error && <p className="mb-2 text-sm text-red-600">{error}</p>}

        {loading ? (
          <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-slate-500">
            Loading vehicles...
          </div>
        ) : vehicles.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-slate-500">
            No vehicles found. Try broadening your filters.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {vehicles.map((vehicle) => (
              <VehicleCard
                key={vehicle._id}
                vehicle={vehicle}
                selected={selected.includes(vehicle._id)}
                onCompareToggle={toggleCompare}
                onFavorite={addFavorite}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
