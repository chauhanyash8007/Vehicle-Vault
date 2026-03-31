import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { api, formatApiError } from "../api/client";

export default function ComparePage() {
  const location = useLocation();
  const [vehicleIds, setVehicleIds] = useState(location.state?.selected?.join(",") || "");
  const [comparison, setComparison] = useState(null);
  const [error, setError] = useState("");
  const ids = useMemo(
    () =>
      vehicleIds
        .split(",")
        .map(v => v.trim())
        .filter(Boolean),
    [vehicleIds]
  );

  async function runCompare() {
    setError("");
    setComparison(null);
    try {
      const { data } = await api.post("/api/compare", { vehicleIds: ids });
      setComparison(data);
    } catch (err) {
      setError(formatApiError(err, "Comparison failed"));
    }
  }

  useEffect(() => {
    if (ids.length >= 2 && ids.length <= 3) runCompare();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Vehicle Comparison</h1>
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <label className="mb-2 block text-sm font-medium">Vehicle IDs (comma separated, 2-3)</label>
        <textarea
          rows={3}
          value={vehicleIds}
          onChange={e => setVehicleIds(e.target.value)}
          className="w-full rounded-md border border-slate-300 p-2 text-sm"
        />
        <button
          onClick={runCompare}
          className="mt-3 rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white"
        >
          Generate Comparison
        </button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {comparison && (
        <div className="grid gap-4 lg:grid-cols-2">
          <section className="rounded-xl border border-slate-200 bg-white p-4">
            <h2 className="mb-3 text-lg font-semibold">Differences</h2>
            <ul className="space-y-2 text-sm">
              {comparison.result?.differences?.map((d, i) => (
                <li key={i} className="rounded-md bg-slate-50 p-2">
                  <strong>{d.field}:</strong> {JSON.stringify(d.values)}
                </li>
              ))}
            </ul>
          </section>
          <section className="rounded-xl border border-slate-200 bg-white p-4">
            <h2 className="mb-3 text-lg font-semibold">Similarities</h2>
            <ul className="space-y-2 text-sm">
              {comparison.result?.similarities?.map((s, i) => (
                <li key={i} className="rounded-md bg-slate-50 p-2">
                  <strong>{s.field}:</strong> {JSON.stringify(s.value)}
                </li>
              ))}
            </ul>
          </section>
          <section className="rounded-xl border border-slate-200 bg-white p-4">
            <h2 className="mb-3 text-lg font-semibold text-emerald-700">Advantages</h2>
            <ul className="list-disc space-y-1 pl-5 text-sm">
              {comparison.result?.advantages?.map((a, i) => (
                <li key={i}>{a}</li>
              ))}
            </ul>
          </section>
          <section className="rounded-xl border border-slate-200 bg-white p-4">
            <h2 className="mb-3 text-lg font-semibold text-amber-700">Disadvantages</h2>
            <ul className="list-disc space-y-1 pl-5 text-sm">
              {comparison.result?.disadvantages?.map((d, i) => (
                <li key={i}>{d}</li>
              ))}
            </ul>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-4 lg:col-span-2">
            <h2 className="mb-3 text-lg font-semibold">Recommendations</h2>
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <h3 className="mb-2 font-medium text-slate-800">Similar Vehicles</h3>
                <ul className="space-y-1 text-sm">
                  {comparison.recommendations?.similarVehicles?.map(v => (
                    <li key={v._id} className="rounded-md bg-slate-50 p-2">
                      {v.name} - {v.brand}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="mb-2 font-medium text-slate-800">Related Accessories</h3>
                <ul className="space-y-1 text-sm">
                  {comparison.recommendations?.accessories?.map(a => (
                    <li key={a._id} className="rounded-md bg-slate-50 p-2">
                      {a.name} (Rs. {a.price})
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
