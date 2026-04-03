import { useCallback, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { api, formatApiError } from "../api/client";
import { useToast } from "../components/Toast";

const PH = "https://placehold.co/400x220/e2e8f0/94a3b8?text=No+Image";

const SPEC_FIELDS = [
  { key: "brand", label: "Brand", icon: "🏷️" },
  { key: "price", label: "Price (Rs.)", icon: "💰" },
  { key: "fuel_type", label: "Fuel Type", icon: "⛽" },
  { key: "mileage", label: "Mileage (km/l)", icon: "📊" },
  { key: "engine", label: "Engine", icon: "⚙️" },
  { key: "transmission", label: "Transmission", icon: "🔧" },
];

function fmt(val) {
  if (val === null || val === undefined) return "N/A";
  if (Array.isArray(val)) return val.join(", ") || "N/A";
  if (typeof val === "object") return JSON.stringify(val);
  return String(val);
}

function getBest(field, values) {
  const nums = values.map((v) => (typeof v === "number" ? v : null));
  if (field === "price") {
    const min = Math.min(...nums.filter((n) => n !== null));
    return values.map((v) => v === min);
  }
  if (field === "mileage") {
    const max = Math.max(...nums.filter((n) => n !== null));
    return values.map((v) => v === max);
  }
  return values.map(() => false);
}

// ── Vehicle Picker ──────────────────────────────────────────────────────────
function VehiclePicker({ selected, onToggle, max = 3 }) {
  const toast = useToast();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [allVehicles, setAllVehicles] = useState([]);

  // Load all vehicles on mount for the picker
  useEffect(() => {
    api
      .get("/api/vehicles", { params: { limit: 50 } })
      .then(({ data }) =>
        setAllVehicles(Array.isArray(data) ? data : data.data || []),
      )
      .catch(() => {});
  }, []);

  const search = useCallback(async (q) => {
    if (!q.trim()) {
      setResults([]);
      return;
    }
    setSearching(true);
    try {
      const { data } = await api.get("/api/vehicles", {
        params: { q, limit: 8 },
      });
      setResults(Array.isArray(data) ? data : data.data || []);
    } catch {
      setResults([]);
    } finally {
      setSearching(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => search(query), 300);
    return () => clearTimeout(t);
  }, [query, search]);

  const displayList = query.trim() ? results : allVehicles;

  function toggle(vehicle) {
    if (selected.find((v) => v._id === vehicle._id)) {
      onToggle(vehicle, "remove");
    } else if (selected.length >= max) {
      toast(`Max ${max} vehicles for comparison`, "warning");
    } else {
      onToggle(vehicle, "add");
    }
  }

  return (
    <div className="card p-5 space-y-4">
      <div>
        <h2 className="section-title">Select Vehicles to Compare</h2>
        <p className="section-sub">
          Choose 2 or 3 vehicles to generate a comparison report
        </p>
      </div>

      {/* Selected chips */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selected.map((v) => (
            <div
              key={v._id}
              className="flex items-center gap-2 rounded-xl border border-brand-200 bg-brand-50 px-3 py-1.5"
            >
              <div className="h-6 w-8 overflow-hidden rounded-md bg-surface-100 flex-shrink-0">
                <img
                  src={v.images?.[0] || PH}
                  alt={v.name}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.target.src = PH;
                  }}
                />
              </div>
              <span className="text-xs font-semibold text-brand-700 max-w-[120px] truncate">
                {v.name}
              </span>
              <button
                onClick={() => onToggle(v, "remove")}
                className="text-brand-400 hover:text-brand-700 transition text-sm leading-none"
              >
                ✕
              </button>
            </div>
          ))}
          <span className="self-center text-xs text-slate-400">
            {selected.length}/{max} selected
          </span>
        </div>
      )}

      {/* Search */}
      <div className="relative">
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
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or brand..."
          className="input pl-10"
        />
        {searching && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin rounded-full border-2 border-surface-200 border-t-brand-600" />
        )}
      </div>

      {/* Vehicle list */}
      <div className="grid gap-2 sm:grid-cols-2 max-h-72 overflow-y-auto pr-1">
        {displayList.map((v) => {
          const isSelected = selected.some((s) => s._id === v._id);
          return (
            <button
              key={v._id}
              onClick={() => toggle(v)}
              className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-all ${
                isSelected
                  ? "border-brand-400 bg-brand-50 shadow-glow"
                  : "border-surface-200 bg-white hover:border-brand-200 hover:bg-surface-50"
              }`}
            >
              <div className="h-12 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-surface-100">
                <img
                  src={v.images?.[0] || PH}
                  alt={v.name}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.target.src = PH;
                  }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 truncate">
                  {v.name}
                </p>
                <p className="text-xs text-slate-500">
                  {v.brand} · {v.fuel_type}
                </p>
                <p className="text-xs font-bold text-brand-600">
                  Rs. {v.price?.toLocaleString()}
                </p>
              </div>
              <div
                className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold transition ${
                  isSelected
                    ? "bg-brand-600 text-white"
                    : "border-2 border-surface-300 text-transparent"
                }`}
              >
                {isSelected ? "✓" : ""}
              </div>
            </button>
          );
        })}
        {displayList.length === 0 && !searching && (
          <p className="col-span-2 py-6 text-center text-sm text-slate-400">
            {query ? "No vehicles found" : "No vehicles available"}
          </p>
        )}
      </div>
    </div>
  );
}

// ── Main Page ───────────────────────────────────────────────────────────────
export default function ComparePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();

  const [selectedVehicles, setSelectedVehicles] = useState([]);
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(false);

  // Pre-load vehicles from home page selection
  useEffect(() => {
    const ids = location.state?.selected;
    if (!Array.isArray(ids) || !ids.length) return;

    // Fetch vehicle details for pre-selected IDs
    Promise.allSettled(ids.map((id) => api.get(`/api/vehicles/${id}`))).then(
      (results) => {
        const vehicles = results
          .filter((r) => r.status === "fulfilled")
          .map((r) => r.value.data);
        setSelectedVehicles(vehicles);
        // Auto-run if 2-3 vehicles
        if (vehicles.length >= 2 && vehicles.length <= 3) {
          runCompare(vehicles.map((v) => v._id));
        }
      },
    );
  }, []);

  function toggleVehicle(vehicle, action) {
    setSelectedVehicles((prev) =>
      action === "remove"
        ? prev.filter((v) => v._id !== vehicle._id)
        : [...prev, vehicle],
    );
    setComparison(null); // reset result when selection changes
  }

  async function runCompare(ids) {
    const compareIds = ids || selectedVehicles.map((v) => v._id);
    if (compareIds.length < 2 || compareIds.length > 3) {
      toast("Select 2 or 3 vehicles to compare", "warning");
      return;
    }
    setLoading(true);
    setComparison(null);
    try {
      const { data } = await api.post("/api/compare", {
        vehicleIds: compareIds,
      });
      setComparison(data);
      // Scroll to results
      setTimeout(
        () =>
          document
            .getElementById("compare-results")
            ?.scrollIntoView({ behavior: "smooth" }),
        100,
      );
    } catch (err) {
      if (err?.response?.status === 401) {
        toast("Please sign in to compare vehicles", "warning");
        navigate("/login");
        return;
      }
      toast(formatApiError(err, "Comparison failed"), "error");
    } finally {
      setLoading(false);
    }
  }

  const vehicles = comparison?.vehicles || [];
  const n = vehicles.length;

  // Determine overall winner (best price + best mileage scoring)
  const winner =
    vehicles.length >= 2
      ? (() => {
          const scores = vehicles.map((v, i) => {
            let score = 0;
            const prices = vehicles.map((x) => x.price);
            const mileages = vehicles.map((x) => x.mileage);
            const minPrice = Math.min(...prices);
            const maxMileage = Math.max(...mileages);
            if (v.price === minPrice) score += 2;
            if (v.mileage === maxMileage) score += 2;
            return { vehicle: v, score, index: i };
          });
          scores.sort((a, b) => b.score - a.score);
          return scores[0].score > 0 ? scores[0].vehicle : null;
        })()
      : null;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-black text-slate-900">
            Vehicle Comparison
          </h1>
          <p className="section-sub">
            Select 2–3 vehicles and generate a detailed comparison report
          </p>
        </div>
        <Link to="/" className="btn-secondary">
          ← Browse Vehicles
        </Link>
      </div>

      {/* Vehicle Picker */}
      <VehiclePicker
        selected={selectedVehicles}
        onToggle={toggleVehicle}
        max={3}
      />

      {/* Compare button */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={() => runCompare()}
          disabled={loading || selectedVehicles.length < 2}
          className="btn-primary btn-lg gap-2 disabled:opacity-50"
        >
          {loading ? (
            <>
              <svg
                className="h-5 w-5 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Generating Report...
            </>
          ) : (
            <>⚖️ Generate Comparison Report</>
          )}
        </button>
        {selectedVehicles.length < 2 && (
          <p className="text-sm text-slate-400">Select at least 2 vehicles</p>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="card flex flex-col items-center gap-4 py-16">
          <div className="h-14 w-14 animate-spin rounded-full border-4 border-surface-200 border-t-brand-600" />
          <p className="font-semibold text-slate-700">Analysing vehicles...</p>
          <p className="text-sm text-slate-400">
            Comparing specifications, pricing, and features
          </p>
        </div>
      )}

      {/* ── Results ── */}
      {comparison && (
        <div id="compare-results" className="space-y-6">
          {/* Winner banner */}
          {winner && (
            <div className="rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-500 p-6 text-white shadow-card-lg animate-scale-in">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 text-3xl">
                  🏆
                </div>
                <div>
                  <p className="text-sm font-medium text-white/70">
                    Best Overall Value
                  </p>
                  <p className="text-2xl font-black">{winner.name}</p>
                  <p className="text-sm text-white/80">
                    {winner.brand} · Rs. {winner.price?.toLocaleString()} ·{" "}
                    {winner.mileage} km/l
                  </p>
                </div>
                <Link
                  to={`/vehicles/${winner._id}`}
                  className="ml-auto rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-emerald-700 hover:bg-emerald-50 transition"
                >
                  View Details →
                </Link>
              </div>
            </div>
          )}

          {/* Vehicle header cards */}
          <div
            className="grid gap-4"
            style={{ gridTemplateColumns: `repeat(${n}, 1fr)` }}
          >
            {vehicles.map((v, i) => (
              <div
                key={v._id}
                className={`card overflow-hidden text-center animate-scale-in ${winner?._id === v._id ? "ring-2 ring-emerald-400 border-emerald-300" : ""}`}
                style={{ animationDelay: `${i * 80}ms` }}
              >
                {winner?._id === v._id && (
                  <div className="bg-emerald-500 py-1 text-center text-xs font-bold text-white">
                    🏆 Best Value
                  </div>
                )}
                <div className="relative h-40 overflow-hidden bg-surface-100">
                  <img
                    src={v.images?.[0] || PH}
                    alt={v.name}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.target.src = PH;
                    }}
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                    <p className="font-bold text-white text-sm leading-tight">
                      {v.name}
                    </p>
                  </div>
                </div>
                <div className="p-3">
                  <p className="text-xs text-slate-500">{v.brand}</p>
                  <p className="mt-1 text-xl font-black text-brand-600">
                    Rs. {v.price?.toLocaleString()}
                  </p>
                  <Link
                    to={`/vehicles/${v._id}`}
                    className="mt-2 inline-block text-xs text-brand-600 hover:underline"
                  >
                    View full details →
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Comparison table */}
          <div className="card overflow-hidden">
            <div className="border-b border-surface-200 bg-surface-50 px-5 py-4">
              <h2 className="font-bold text-slate-900">
                Specification Comparison
              </h2>
              <div className="mt-1 flex flex-wrap gap-3 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <span className="h-3 w-3 rounded bg-amber-100 border border-amber-200" />{" "}
                  Difference
                </span>
                <span className="flex items-center gap-1">
                  <span className="text-emerald-500">★</span> Best value
                </span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-surface-50 border-b border-surface-200">
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400 w-40">
                      Specification
                    </th>
                    {vehicles.map((v) => (
                      <th
                        key={v._id}
                        className="px-5 py-3 text-left text-xs font-semibold text-slate-700"
                      >
                        <div className="flex items-center gap-1.5">
                          {winner?._id === v._id && (
                            <span className="text-emerald-500">🏆</span>
                          )}
                          {v.name}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {SPEC_FIELDS.map(({ key, label, icon }) => {
                    const values = vehicles.map((v) => v[key]);
                    const allSame = values.every(
                      (v) => JSON.stringify(v) === JSON.stringify(values[0]),
                    );
                    const best = getBest(key, values);
                    return (
                      <tr
                        key={key}
                        className={`border-b border-surface-100 ${!allSame ? "bg-amber-50/50" : "hover:bg-surface-50"}`}
                      >
                        <td className="px-5 py-3.5 text-xs font-semibold text-slate-500">
                          <span className="mr-1.5">{icon}</span>
                          {label}
                        </td>
                        {values.map((val, i) => (
                          <td
                            key={i}
                            className={`px-5 py-3.5 font-medium ${
                              best[i]
                                ? "text-emerald-700 font-bold"
                                : allSame
                                  ? "text-slate-600"
                                  : "text-slate-900"
                            }`}
                          >
                            {best[i] && (
                              <span className="mr-1 text-emerald-500">★</span>
                            )}
                            {key === "price"
                              ? `Rs. ${Number(val)?.toLocaleString()}`
                              : fmt(val)}
                          </td>
                        ))}
                      </tr>
                    );
                  })}

                  {/* Features row */}
                  <tr className="border-b border-surface-100 hover:bg-surface-50">
                    <td className="px-5 py-3.5 text-xs font-semibold text-slate-500">
                      <span className="mr-1.5">✨</span>Features
                    </td>
                    {vehicles.map((v) => (
                      <td key={v._id} className="px-5 py-3.5">
                        <div className="flex flex-wrap gap-1">
                          {v.features?.length ? (
                            v.features.slice(0, 4).map((f, i) => (
                              <span
                                key={i}
                                className="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-medium text-brand-600"
                              >
                                {f}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-slate-400">N/A</span>
                          )}
                          {v.features?.length > 4 && (
                            <span className="rounded-full bg-surface-100 px-2 py-0.5 text-[10px] text-slate-400">
                              +{v.features.length - 4}
                            </span>
                          )}
                        </div>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Advantages & Disadvantages */}
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="card p-5">
              <h2 className="mb-4 flex items-center gap-2 font-bold text-emerald-700">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-base">
                  ✓
                </span>
                Advantages
              </h2>
              {comparison.result?.advantages?.length ? (
                <ul className="space-y-2">
                  {comparison.result.advantages.map((a, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2.5 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
                    >
                      <span className="mt-0.5 flex-shrink-0 font-bold text-emerald-500">
                        ✓
                      </span>
                      {a}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-400">No advantages noted</p>
              )}
            </div>
            <div className="card p-5">
              <h2 className="mb-4 flex items-center gap-2 font-bold text-rose-700">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-100 text-base">
                  ✗
                </span>
                Disadvantages
              </h2>
              {comparison.result?.disadvantages?.length ? (
                <ul className="space-y-2">
                  {comparison.result.disadvantages.map((d, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2.5 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-800"
                    >
                      <span className="mt-0.5 flex-shrink-0 font-bold text-rose-400">
                        ✗
                      </span>
                      {d}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-400">No disadvantages noted</p>
              )}
            </div>
          </div>

          {/* Similarities */}
          {comparison.result?.similarities?.length > 0 && (
            <div className="card p-5">
              <h2 className="mb-3 font-bold text-slate-900">
                🔗 Common Characteristics
              </h2>
              <p className="mb-3 text-sm text-slate-500">
                These specifications are identical across all compared vehicles.
              </p>
              <div className="flex flex-wrap gap-2">
                {comparison.result.similarities.map((s, i) => (
                  <span key={i} className="badge-brand text-xs px-3 py-1.5">
                    {s.field.replace(/_/g, " ")}: {fmt(s.value)}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Summary */}
          <div className="rounded-2xl border border-brand-200 bg-brand-50 p-5">
            <h2 className="mb-2 font-bold text-brand-900">
              📋 Comparison Summary
            </h2>
            <p className="text-sm text-brand-800 leading-relaxed">
              {comparison.result?.summary ||
                "Comparison completed successfully."}
              {winner &&
                ` Based on price and mileage analysis, ${winner.name} offers the best overall value among the compared vehicles.`}
            </p>
          </div>

          {/* Accessories for compared vehicles */}
          {comparison.recommendations?.accessories?.length > 0 && (
            <div className="card p-5">
              <h2 className="section-title mb-1">🔩 Suggested Accessories</h2>
              <p className="section-sub mb-4">
                Accessories available for vehicles similar to your selection
              </p>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {comparison.recommendations.accessories.map((a) => (
                  <div
                    key={a._id}
                    className="flex items-center justify-between rounded-xl bg-surface-50 p-3"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-800 text-sm truncate">
                        {a.name}
                      </p>
                      {a.description && (
                        <p className="text-xs text-slate-500 mt-0.5 truncate">
                          {a.description}
                        </p>
                      )}
                    </div>
                    <span className="flex-shrink-0 ml-3 font-bold text-emerald-600 text-sm">
                      Rs. {a.price?.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Similar vehicles */}
          {comparison.recommendations?.similarVehicles?.length > 0 && (
            <div className="card p-5">
              <h2 className="section-title mb-1">🚗 You Might Also Consider</h2>
              <p className="section-sub mb-4">
                Similar vehicles in the same price range
              </p>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {comparison.recommendations.similarVehicles.map((v) => (
                  <Link
                    key={v._id}
                    to={`/vehicles/${v._id}`}
                    className="flex items-center gap-3 rounded-xl border border-surface-200 p-3 hover:border-brand-200 hover:bg-brand-50 transition group"
                  >
                    <div className="h-12 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-surface-100">
                      <img
                        src={v.images?.[0] || PH}
                        alt={v.name}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.target.src = PH;
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800 group-hover:text-brand-600 transition text-sm truncate">
                        {v.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {v.brand} · {v.fuel_type}
                      </p>
                      <p className="text-xs font-bold text-brand-600">
                        Rs. {v.price?.toLocaleString()}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Re-compare button */}
          <div className="flex justify-center">
            <button
              onClick={() => {
                setComparison(null);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="btn-secondary gap-2"
            >
              ← Change Selection
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
