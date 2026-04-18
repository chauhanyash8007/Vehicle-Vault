import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";

const PH = "https://placehold.co/48x32/e2e8f0/94a3b8?text=VV";
const STORAGE_KEY = "vv_recent_searches";
const MAX_RECENT = 5;
const POPULAR_BRANDS = ["Toyota", "Honda", "Suzuki", "Hyundai", "Kia"];

const FUEL_COLORS = {
  Petrol: "bg-orange-100 text-orange-700",
  Diesel: "bg-blue-100 text-blue-700",
  Electric: "bg-emerald-100 text-emerald-700",
  Hybrid: "bg-teal-100 text-teal-700",
  CNG: "bg-violet-100 text-violet-700",
};

function getRecentSearches() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; }
}

function saveRecentSearch(q) {
  if (!q?.trim()) return;
  const prev = getRecentSearches().filter(s => s !== q);
  localStorage.setItem(STORAGE_KEY, JSON.stringify([q, ...prev].slice(0, MAX_RECENT)));
}

function removeRecentSearch(q) {
  const prev = getRecentSearches().filter(s => s !== q);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prev));
}

export default function SearchAutocomplete({ onSearch, initialValue = "" }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState(initialValue);
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState(getRecentSearches);
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  const fetchSuggestions = useCallback(async (q) => {
    if (!q || q.trim().length < 1) { setSuggestions([]); return; }
    setLoading(true);
    try {
      const { data } = await api.get("/api/vehicles/autocomplete", { params: { q } });
      setSuggestions(data || []);
    } catch { setSuggestions([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => fetchSuggestions(query), 250);
    return () => clearTimeout(t);
  }, [query, fetchSuggestions]);

  // Show dropdown on focus
  useEffect(() => {
    if (open) return;
  }, [open]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false); setActiveIdx(-1);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const showEmpty = open && !query.trim();
  const showResults = open && query.trim().length > 0;
  const brands = suggestions.filter(s => s.type === "brand");
  const vehicles = suggestions.filter(s => s.type === "vehicle");
  const allItems = [...brands, ...vehicles];

  function doSearch(val) {
    const q = val?.trim();
    if (!q) return;
    saveRecentSearch(q);
    setRecentSearches(getRecentSearches());
    onSearch?.(q);
    setOpen(false);
    setActiveIdx(-1);
  }

  function handleSelect(s) {
    if (s.type === "vehicle") {
      saveRecentSearch(s.label);
      setRecentSearches(getRecentSearches());
      navigate(`/vehicles/${s._id}`);
      setOpen(false);
    } else {
      setQuery(s.label);
      doSearch(s.label);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "ArrowDown") { e.preventDefault(); setActiveIdx(i => Math.min(i + 1, allItems.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActiveIdx(i => Math.max(i - 1, -1)); }
    else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIdx >= 0 && allItems[activeIdx]) handleSelect(allItems[activeIdx]);
      else doSearch(query);
    }
    else if (e.key === "Escape") { setOpen(false); setActiveIdx(-1); inputRef.current?.blur(); }
  }

  function clearSearch() {
    setQuery(""); setSuggestions([]); setOpen(false); onSearch?.("");
    inputRef.current?.focus();
  }

  return (
    <div ref={containerRef} className="relative flex-1">
      {/* ── Input ── */}
      <div className="relative">
        <svg className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => { setQuery(e.target.value); setActiveIdx(-1); setOpen(true); }}
          onKeyDown={handleKeyDown}
          onFocus={() => setOpen(true)}
          placeholder="Search vehicles, brands, engines..."
          className="input pl-10 pr-10"
          autoComplete="off"
          spellCheck={false}
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin rounded-full border-2 border-surface-200 border-t-brand-600" />
        )}
        {!loading && query && (
          <button onClick={clearSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* ── Dropdown ── */}
      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1.5 overflow-hidden rounded-2xl border border-surface-200 bg-white shadow-card-lg animate-slide-down max-h-[480px] overflow-y-auto">

          {/* Empty state — show recent + popular */}
          {showEmpty && (
            <div className="p-3 space-y-4">
              {/* Recent searches */}
              {recentSearches.length > 0 && (
                <div>
                  <div className="flex items-center justify-between px-1 mb-2">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Recent Searches</p>
                    <button onClick={() => { localStorage.removeItem(STORAGE_KEY); setRecentSearches([]); }}
                      className="text-[10px] text-slate-400 hover:text-rose-500 transition">Clear all</button>
                  </div>
                  <div className="space-y-0.5">
                    {recentSearches.map((s, i) => (
                      <div key={i} className="flex items-center gap-2 group">
                        <button onMouseDown={() => { setQuery(s); doSearch(s); }}
                          className="flex flex-1 items-center gap-2.5 rounded-xl px-3 py-2 text-left hover:bg-surface-50 transition">
                          <svg className="h-3.5 w-3.5 text-slate-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-sm text-slate-700">{s}</span>
                        </button>
                        <button onMouseDown={(e) => { e.preventDefault(); removeRecentSearch(s); setRecentSearches(getRecentSearches()); }}
                          className="opacity-0 group-hover:opacity-100 p-1 text-slate-300 hover:text-slate-500 transition">
                          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Popular brands */}
              <div>
                <p className="px-1 mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">Popular Brands</p>
                <div className="flex flex-wrap gap-2 px-1">
                  {POPULAR_BRANDS.map(b => (
                    <button key={b} onMouseDown={() => { setQuery(b); doSearch(b); }}
                      className="flex items-center gap-1.5 rounded-xl border border-surface-200 bg-surface-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 transition">
                      🏷️ {b}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Results */}
          {showResults && (
            <>
              {/* Brand results */}
              {brands.length > 0 && (
                <div>
                  <p className="px-4 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">Brands</p>
                  {brands.map((s, i) => (
                    <button key={i} onMouseDown={() => handleSelect(s)}
                      className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition ${activeIdx === i ? "bg-brand-50" : "hover:bg-surface-50"}`}>
                      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-100 text-sm flex-shrink-0">🏷️</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800">
                          {s.label}
                        </p>
                        <p className="text-xs text-slate-400">{s.count} vehicle{s.count !== 1 ? "s" : ""} available</p>
                      </div>
                      <svg className="h-4 w-4 text-slate-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  ))}
                </div>
              )}

              {/* Vehicle results */}
              {vehicles.length > 0 && (
                <div>
                  <p className="px-4 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">Vehicles</p>
                  {vehicles.map((s, i) => {
                    const idx = brands.length + i;
                    return (
                      <button key={s._id} onMouseDown={() => handleSelect(s)}
                        className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition ${activeIdx === idx ? "bg-brand-50" : "hover:bg-surface-50"}`}>
                        <div className="h-10 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-surface-100">
                          <img src={s.image || PH} alt={s.label} className="h-full w-full object-cover"
                            onError={(e) => { e.target.src = PH; }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-800 truncate">
                            {s.label}
                          </p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-xs text-slate-400">{s.sublabel}</span>
                            <span className="text-slate-200">·</span>
                            <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${FUEL_COLORS[s.fuel_type] || "bg-slate-100 text-slate-600"}`}>
                              {s.fuel_type}
                            </span>
                            {s.mileage > 0 && (
                              <>
                                <span className="text-slate-200">·</span>
                                <span className="text-[10px] text-slate-400">{s.mileage} km/l</span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex-shrink-0 text-right">
                          <p className="text-xs font-bold text-brand-600">Rs. {s.price?.toLocaleString()}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* No results */}
              {!loading && brands.length === 0 && vehicles.length === 0 && (
                <div className="px-4 py-8 text-center">
                  <p className="text-2xl mb-2">🔍</p>
                  <p className="text-sm font-medium text-slate-600">No results for "{query}"</p>
                  <p className="text-xs text-slate-400 mt-1">Try a different name or brand</p>
                </div>
              )}

              {/* Footer */}
              {(brands.length > 0 || vehicles.length > 0) && (
                <div className="border-t border-surface-100 px-4 py-2.5 flex items-center justify-between bg-surface-50">
                  <p className="text-[10px] text-slate-400">↑↓ navigate · Enter select · Esc close</p>
                  <button onMouseDown={() => doSearch(query)}
                    className="text-xs font-semibold text-brand-600 hover:text-brand-700 transition">
                    Search all results →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
