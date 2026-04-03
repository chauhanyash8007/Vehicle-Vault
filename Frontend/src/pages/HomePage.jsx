import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, formatApiError } from "../api/client";
import { useAuth } from "../state/AuthContext";
import { useToast } from "../components/Toast";
import VehicleCard from "../components/VehicleCard";

const INIT = {
  q: "",
  brand: "",
  fuel_type: "",
  transmission: "",
  minPrice: "",
  maxPrice: "",
  minMileage: "",
  maxMileage: "",
};
const FUELS = ["Petrol", "Diesel", "Electric", "Hybrid", "CNG"];
const TRANS = ["Manual", "Automatic", "CVT", "AMT"];

function Spinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-surface-200 border-t-brand-600" />
    </div>
  );
}

export default function HomePage() {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const toast = useToast();
  const vehiclesRef = useRef(null);

  const [filters, setFilters] = useState(INIT);
  const [vehicles, setVehicles] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    totalPages: 1,
  });
  const [page, setPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);
  // Track the filters that were last applied (so pagination uses correct filters)
  const [appliedFilters, setAppliedFilters] = useState(INIT);

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  async function fetchVehicles(p = 1, f = appliedFilters) {
    setLoading(true);
    try {
      const params = {
        ...Object.fromEntries(Object.entries(f).filter(([, v]) => v !== "")),
        page: p,
        limit: 12,
        withMeta: "true",
      };
      const { data } = await api.get("/api/vehicles", { params });
      setVehicles(Array.isArray(data) ? data : data.data || []);
      if (data.pagination) setPagination(data.pagination);
    } catch (err) {
      toast(formatApiError(err, "Failed to load vehicles"), "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchVehicles(page, appliedFilters);
  }, [page]);

  function applyFilters() {
    setAppliedFilters(filters);
    setPage(1);
    fetchVehicles(1, filters);
  }
  function resetFilters() {
    setFilters(INIT);
    setAppliedFilters(INIT);
    setPage(1);
    fetchVehicles(1, INIT);
  }

  function toggleCompare(id) {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 3) {
        toast("Max 3 vehicles for comparison", "warning");
        return prev;
      }
      return [...prev, id];
    });
  }

  async function addFavorite(vehicleId) {
    if (!isLoggedIn) {
      toast("Sign in to save favorites", "warning");
      return navigate("/login");
    }
    try {
      await api.post("/api/favorites", { vehicle_id: vehicleId });
      toast("Saved to favorites ♥");
    } catch (err) {
      toast(formatApiError(err, "Could not save"), "error");
    }
  }

  const stats = useMemo(
    () => [
      {
        label: "Total Vehicles",
        value: pagination.total || vehicles.length,
        icon: "🚗",
        color: "text-brand-600",
      },
      {
        label: "Comparing",
        value: `${selected.length} / 3`,
        icon: "⚖️",
        color: "text-violet-600",
      },
      {
        label: "Total Pages",
        value: pagination.totalPages || 1,
        icon: "📄",
        color: "text-emerald-600",
      },
    ],
    [pagination, vehicles.length, selected.length],
  );

  return (
    <div className="space-y-8 animate-fade-in">
      {/* ── Hero ── */}
      <section className="relative overflow-hidden rounded-3xl bg-hero px-8 py-14 text-white shadow-card-lg">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-white/5 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 left-1/3 h-64 w-64 rounded-full bg-violet-500/20 blur-3xl" />

        <div className="relative z-10 mx-auto max-w-2xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-medium backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse-soft" />
            Smart Car Comparison Platform
          </div>
          <h1 className="text-4xl font-black leading-tight md:text-6xl">
            Find Your <br />
            <span className="bg-gradient-to-r from-brand-300 to-violet-300 bg-clip-text text-transparent">
              Perfect Car
            </span>
          </h1>
          <p className="mt-4 text-base text-white/70 md:text-lg max-w-lg">
            Compare 2–3 vehicles side by side, explore detailed specs, read real
            reviews, and make smarter buying decisions.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <button
              onClick={() =>
                vehiclesRef.current?.scrollIntoView({ behavior: "smooth" })
              }
              className="rounded-2xl bg-white px-7 py-3.5 text-sm font-bold text-brand-700 shadow-card-md transition hover:bg-brand-50 active:scale-[0.97]"
            >
              Browse Vehicles →
            </button>
            {selected.length >= 2 && (
              <button
                onClick={() => navigate("/compare", { state: { selected } })}
                className="rounded-2xl border border-white/30 bg-white/10 px-7 py-3.5 text-sm font-bold text-white backdrop-blur transition hover:bg-white/20 active:scale-[0.97]"
              >
                Compare {selected.length} Vehicles ⚖️
              </button>
            )}
          </div>
        </div>

        {/* Feature pills */}
        <div className="relative z-10 mt-10 flex flex-wrap gap-2">
          {[
            "Side-by-side comparison",
            "Smart recommendations",
            "Real user reviews",
            "Save favorites",
          ].map((f) => (
            <span
              key={f}
              className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs text-white/70 backdrop-blur"
            >
              ✓ {f}
            </span>
          ))}
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="grid gap-4 sm:grid-cols-3">
        {stats.map(({ label, value, icon, color }) => (
          <div key={label} className="stat-card">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                {label}
              </p>
              <span className="text-xl">{icon}</span>
            </div>
            <p className={`text-3xl font-black ${color}`}>{value}</p>
          </div>
        ))}
      </section>

      {/* ── Search & Filters ── */}
      <section className="card p-5">
        {/* Search bar */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <svg
              className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              value={filters.q}
              onChange={(e) => setFilters((p) => ({ ...p, q: e.target.value }))}
              onKeyDown={(e) => e.key === "Enter" && applyFilters()}
              placeholder="Search by name, brand, engine..."
              className="input pl-10"
            />
          </div>
          <button
            onClick={() => setFiltersOpen((v) => !v)}
            className={`btn-secondary flex items-center gap-2 ${filtersOpen ? "border-brand-300 bg-brand-50 text-brand-700" : ""}`}
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
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z"
              />
            </svg>
            Filters
            {activeFilterCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-[10px] font-bold text-white">
                {activeFilterCount}
              </span>
            )}
          </button>
          <button onClick={applyFilters} className="btn-primary">
            Search
          </button>
        </div>

        {/* Expandable filters */}
        {filtersOpen && (
          <div className="mt-4 animate-slide-down border-t border-surface-100 pt-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <input
                value={filters.brand}
                onChange={(e) =>
                  setFilters((p) => ({ ...p, brand: e.target.value }))
                }
                placeholder="Brand (e.g. Toyota)"
                className="input"
              />
              <select
                value={filters.fuel_type}
                onChange={(e) =>
                  setFilters((p) => ({ ...p, fuel_type: e.target.value }))
                }
                className="input"
              >
                <option value="">All Fuel Types</option>
                {FUELS.map((f) => (
                  <option key={f}>{f}</option>
                ))}
              </select>
              <select
                value={filters.transmission}
                onChange={(e) =>
                  setFilters((p) => ({ ...p, transmission: e.target.value }))
                }
                className="input"
              >
                <option value="">All Transmissions</option>
                {TRANS.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={filters.minPrice}
                  onChange={(e) =>
                    setFilters((p) => ({ ...p, minPrice: e.target.value }))
                  }
                  placeholder="Min Price"
                  className="input"
                />
                <input
                  type="number"
                  value={filters.maxPrice}
                  onChange={(e) =>
                    setFilters((p) => ({ ...p, maxPrice: e.target.value }))
                  }
                  placeholder="Max Price"
                  className="input"
                />
              </div>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={filters.minMileage}
                  onChange={(e) =>
                    setFilters((p) => ({ ...p, minMileage: e.target.value }))
                  }
                  placeholder="Min Mileage"
                  className="input"
                />
                <input
                  type="number"
                  value={filters.maxMileage}
                  onChange={(e) =>
                    setFilters((p) => ({ ...p, maxMileage: e.target.value }))
                  }
                  placeholder="Max Mileage"
                  className="input"
                />
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <button onClick={applyFilters} className="btn-primary btn-sm">
                Apply
              </button>
              <button onClick={resetFilters} className="btn-secondary btn-sm">
                Clear all
              </button>
            </div>
          </div>
        )}
      </section>

      {/* ── Compare bar (sticky when items selected) ── */}
      {selected.length > 0 && (
        <div className="sticky top-20 z-30 animate-slide-down">
          <div className="rounded-2xl border border-brand-200 bg-brand-600 px-5 py-3 shadow-card-lg">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-sm font-bold text-white">
                  {selected.length}
                </span>
                <p className="text-sm font-semibold text-white">
                  {selected.length === 1
                    ? "1 vehicle selected — pick 1 or 2 more"
                    : `${selected.length} vehicles ready to compare`}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelected([])}
                  className="rounded-xl border border-white/30 px-3 py-1.5 text-xs font-medium text-white/80 hover:bg-white/10 transition"
                >
                  Clear
                </button>
                <button
                  disabled={selected.length < 2}
                  onClick={() => navigate("/compare", { state: { selected } })}
                  className="rounded-xl bg-white px-4 py-1.5 text-xs font-bold text-brand-700 hover:bg-brand-50 transition disabled:opacity-50"
                >
                  Compare Now →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Vehicles grid ── */}
      <section ref={vehiclesRef} className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="section-title">
              {pagination.total > 0
                ? `${pagination.total} Vehicles`
                : "Vehicles"}
            </h2>
            <p className="section-sub">Select 2–3 to compare side by side</p>
          </div>
          {pagination.totalPages > 1 && (
            <p className="text-sm text-slate-500">
              Page {page} of {pagination.totalPages}
            </p>
          )}
        </div>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-80 skeleton" />
            ))}
          </div>
        ) : vehicles.length === 0 ? (
          <div className="card flex flex-col items-center gap-3 py-20 text-center">
            <span className="text-5xl">🔍</span>
            <p className="font-semibold text-slate-700">No vehicles found</p>
            <p className="text-sm text-slate-400">Try adjusting your filters</p>
            <button
              onClick={resetFilters}
              className="btn-secondary btn-sm mt-1"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {vehicles.map((v, i) => (
              <div
                key={v._id}
                className="animate-fade-in"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <VehicleCard
                  vehicle={v}
                  selected={selected.includes(v._id)}
                  onCompareToggle={toggleCompare}
                  onFavorite={addFavorite}
                />
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="btn-secondary btn-sm disabled:opacity-40"
            >
              ← Prev
            </button>
            <div className="flex gap-1">
              {Array.from(
                { length: Math.min(pagination.totalPages, 7) },
                (_, i) => {
                  const p = i + 1;
                  return (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`h-8 w-8 rounded-lg text-xs font-semibold transition ${p === page ? "bg-brand-600 text-white" : "text-slate-600 hover:bg-surface-100"}`}
                    >
                      {p}
                    </button>
                  );
                },
              )}
            </div>
            <button
              disabled={page >= pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="btn-secondary btn-sm disabled:opacity-40"
            >
              Next →
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
