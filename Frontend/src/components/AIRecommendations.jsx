import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { useToast } from "./Toast";

const PH = "https://placehold.co/300x180/e2e8f0/94a3b8?text=No+Image";
const FUEL_COLORS = { Petrol: "bg-orange-100 text-orange-700", Diesel: "bg-blue-100 text-blue-700", Electric: "bg-emerald-100 text-emerald-700", Hybrid: "bg-teal-100 text-teal-700", CNG: "bg-violet-100 text-violet-700" };
const TAG_META = { best_value: { label: "Best Value", color: "bg-emerald-100 text-emerald-700", icon: "💰" }, same_brand: { label: "Same Brand", color: "bg-brand-100 text-brand-700", icon: "🏷️" }, alternative_fuel: { label: "Alt. Fuel", color: "bg-violet-100 text-violet-700", icon: "⚡" } };
const SORT_OPTIONS = [{ value: "score", label: "Best Match" }, { value: "price_asc", label: "Price: Low → High" }, { value: "price_desc", label: "Price: High → Low" }, { value: "mileage", label: "Best Mileage" }];
const BREAKDOWN_LABELS = { brand: { label: "Brand", max: 25 }, fuelType: { label: "Fuel Type", max: 20 }, transmission: { label: "Transmission", max: 15 }, price: { label: "Price Match", max: 20 }, mileage: { label: "Mileage", max: 10 }, features: { label: "Features", max: 10 }, value: { label: "Value Bonus", max: 5 } };

function ScoreRing({ score }) {
  const r = 20, circ = 2 * Math.PI * r;
  const pct = Math.min(100, Math.max(0, score));
  const dash = (pct / 100) * circ;
  const color = pct >= 70 ? "#10b981" : pct >= 45 ? "#f59e0b" : "#f87171";
  return (
    <div className="relative flex h-14 w-14 items-center justify-center flex-shrink-0">
      <svg className="absolute inset-0 -rotate-90" width="56" height="56" viewBox="0 0 56 56">
        <circle cx="28" cy="28" r={r} fill="none" stroke="#e2e8f0" strokeWidth="4" />
        <circle cx="28" cy="28" r={r} fill="none" stroke={color} strokeWidth="4"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          style={{ transition: "stroke-dasharray 0.8s ease" }} />
      </svg>
      <span className="text-xs font-black" style={{ color }}>{pct}%</span>
    </div>
  );
}

function BreakdownBar({ label, value, max }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-24 flex-shrink-0 text-slate-500">{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-surface-200 overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${pct > 0 ? "bg-brand-500" : ""}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="w-8 text-right font-semibold text-slate-600">{value}/{max}</span>
    </div>
  );
}

export default function AIRecommendations({ vehicleId }) {
  const navigate = useNavigate();
  const toast = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [breakdown, setBreakdown] = useState(null);
  const [sortBy, setSortBy] = useState("score");
  const [fuelFilter, setFuelFilter] = useState("");
  const [compareQueue, setCompareQueue] = useState([]);

  function load(sort = sortBy, fuel = fuelFilter) {
    if (!vehicleId) return;
    setLoading(true);
    const params = { sortBy: sort };
    if (fuel) params.fuel_type = fuel;
    api.get(`/api/vehicles/${vehicleId}/ai-recommendations`, { params })
      .then(({ data: d }) => setData(d))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, [vehicleId]);

  function handleSort(val) { setSortBy(val); load(val, fuelFilter); }
  function handleFuel(val) { setFuelFilter(val); load(sortBy, val); }

  function toggleCompare(id) {
    setCompareQueue(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id);
      if (prev.length >= 2) { toast("Max 2 additional vehicles for comparison", "warning"); return prev; }
      return [...prev, id];
    });
  }

  function goCompare() {
    navigate("/compare", { state: { selected: [vehicleId, ...compareQueue] } });
  }

  if (loading) return (
    <div className="card p-5 space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100 text-lg animate-pulse-soft">🤖</div>
        <div className="space-y-1.5">
          <div className="h-4 w-48 skeleton" />
          <div className="h-3 w-64 skeleton" />
        </div>
      </div>
      {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-24 skeleton" />)}
    </div>
  );

  if (!data?.recommendations?.length) return null;

  const { recommendations, accessories, meta, basedOn } = data;
  const fuelTypes = [...new Set(recommendations.map(v => v.fuel_type))];

  return (
    <div className="card overflow-hidden">
      {/* ── Header ── */}
      <div className="border-b border-surface-200 bg-gradient-to-r from-brand-50 via-violet-50 to-surface-50 px-5 py-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-600 text-xl shadow-sm">🤖</div>
            <div>
              <h2 className="font-bold text-slate-900">AI-Powered Recommendations</h2>
              <p className="text-xs text-slate-500">
                {meta?.total} vehicles analysed · avg match <span className="font-semibold text-brand-600">{meta?.avgScore}%</span> · based on <span className="font-semibold text-slate-700">{basedOn?.name}</span>
              </p>
            </div>
          </div>
          {/* Compare queue button */}
          {compareQueue.length > 0 && (
            <button onClick={goCompare}
              className="flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-brand-700 transition animate-scale-in">
              ⚖️ Compare {compareQueue.length + 1} vehicles
            </button>
          )}
        </div>

        {/* Controls */}
        <div className="mt-3 flex flex-wrap gap-2">
          {/* Sort */}
          <select value={sortBy} onChange={(e) => handleSort(e.target.value)}
            className="rounded-xl border border-surface-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-200">
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          {/* Fuel filter */}
          <select value={fuelFilter} onChange={(e) => handleFuel(e.target.value)}
            className="rounded-xl border border-surface-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-200">
            <option value="">All Fuel Types</option>
            {fuelTypes.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
          {(sortBy !== "score" || fuelFilter) && (
            <button onClick={() => { setSortBy("score"); setFuelFilter(""); load("score", ""); }}
              className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-100 transition">
              ✕ Reset filters
            </button>
          )}
        </div>
      </div>

      {/* ── Recommendations ── */}
      <div className="divide-y divide-surface-100">
        {recommendations.map((v, i) => {
          const inQueue = compareQueue.includes(v._id);
          const isBestValue = meta?.bestValueId === v._id;
          const tagMeta = v.aiTag ? TAG_META[v.aiTag] : null;

          return (
            <div key={v._id} className={`p-4 transition ${inQueue ? "bg-brand-50/50" : "hover:bg-surface-50"}`}>
              <div className="flex items-start gap-3">
                {/* Rank */}
                <div className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-black shadow-sm ${
                  i === 0 ? "bg-amber-400 text-white" : i === 1 ? "bg-slate-300 text-white" : i === 2 ? "bg-orange-300 text-white" : "bg-surface-200 text-slate-500"
                }`}>
                  {i < 3 ? ["🥇","🥈","🥉"][i] : `#${i+1}`}
                </div>

                {/* Image */}
                <div className="h-16 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-surface-100">
                  <img src={v.images?.[0] || PH} alt={v.name} className="h-full w-full object-cover"
                    onError={(e) => { e.target.src = PH; }} />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <p className="font-bold text-slate-900 leading-tight">{v.name}</p>
                        {isBestValue && <span className="badge bg-emerald-100 text-emerald-700 text-[10px]">💰 Best Value</span>}
                        {tagMeta && !isBestValue && <span className={`badge text-[10px] ${tagMeta.color}`}>{tagMeta.icon} {tagMeta.label}</span>}
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                        <span className="text-xs text-slate-500">{v.brand}</span>
                        <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${FUEL_COLORS[v.fuel_type] || "bg-slate-100 text-slate-600"}`}>{v.fuel_type}</span>
                        {v.mileage > 0 && <span className="text-[10px] text-slate-400">{v.mileage} km/l</span>}
                      </div>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <p className="font-black text-brand-600 text-sm">Rs. {v.price?.toLocaleString()}</p>
                      <p className="text-[10px] text-slate-400">{v.transmission}</p>
                    </div>
                  </div>

                  {/* Score ring + reasons toggle */}
                  <div className="flex items-center gap-3">
                    <ScoreRing score={v.aiScore} />
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap gap-1">
                        {v.aiReasons?.slice(0, 3).map((r, ri) => (
                          <span key={ri} className="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-medium text-brand-700">✓ {r}</span>
                        ))}
                        {v.aiReasons?.length > 3 && (
                          <button onClick={() => setExpanded(expanded === v._id ? null : v._id)}
                            className="rounded-full bg-surface-100 px-2 py-0.5 text-[10px] text-slate-500 hover:bg-surface-200 transition">
                            +{v.aiReasons.length - 3} more
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded reasons */}
                  {expanded === v._id && v.aiReasons?.length > 3 && (
                    <div className="flex flex-wrap gap-1 animate-fade-in">
                      {v.aiReasons.slice(3).map((r, ri) => (
                        <span key={ri} className="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-medium text-brand-700">✓ {r}</span>
                      ))}
                    </div>
                  )}

                  {/* Score breakdown */}
                  {breakdown === v._id && v.aiBreakdown && (
                    <div className="mt-2 rounded-xl border border-surface-200 bg-surface-50 p-3 space-y-1.5 animate-fade-in">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-2">Score Breakdown</p>
                      {Object.entries(BREAKDOWN_LABELS).map(([key, { label, max }]) => (
                        <BreakdownBar key={key} label={label} value={v.aiBreakdown[key] || 0} max={max} />
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2 pt-0.5">
                    <Link to={`/vehicles/${v._id}`} className="btn-secondary btn-sm text-xs">View Details</Link>
                    <button onClick={() => setBreakdown(breakdown === v._id ? null : v._id)}
                      className="btn-sm rounded-xl border border-surface-200 px-3 text-xs text-slate-600 hover:bg-surface-100 transition">
                      {breakdown === v._id ? "Hide Score" : "📊 Score"}
                    </button>
                    <button onClick={() => toggleCompare(v._id)}
                      className={`btn-sm rounded-xl px-3 text-xs font-semibold transition ${inQueue ? "bg-brand-600 text-white hover:bg-brand-700" : "border border-brand-200 bg-brand-50 text-brand-700 hover:bg-brand-100"}`}>
                      {inQueue ? "✓ Added" : "⚖️ Compare"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Accessories ── */}
      {accessories?.length > 0 && (
        <div className="border-t border-surface-200 bg-surface-50 p-5">
          <p className="mb-3 text-sm font-bold text-slate-900">🔩 Accessories for Recommended Vehicles</p>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {accessories.slice(0, 6).map((a) => (
              <div key={a._id} className="flex items-center justify-between rounded-xl bg-white border border-surface-200 px-3 py-2.5 shadow-card">
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-800 truncate">{a.name}</p>
                  {a.description && <p className="text-[10px] text-slate-400 truncate mt-0.5">{a.description}</p>}
                </div>
                <span className="ml-2 flex-shrink-0 text-xs font-bold text-emerald-600">Rs. {a.price?.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
