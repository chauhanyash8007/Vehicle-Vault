import { useState } from "react";
import { Link } from "react-router-dom";

const PLACEHOLDER = "https://placehold.co/480x270/e2e8f0/94a3b8?text=No+Image";

const FUEL_COLORS = {
  Petrol: "bg-orange-100 text-orange-700",
  Diesel: "bg-blue-100 text-blue-700",
  Electric: "bg-emerald-100 text-emerald-700",
  Hybrid: "bg-teal-100 text-teal-700",
  CNG: "bg-violet-100 text-violet-700",
};

export default function VehicleCard({
  vehicle,
  onCompareToggle,
  selected,
  onFavorite,
}) {
  const [imgError, setImgError] = useState(false);
  const rawUrl = vehicle.images?.find((u) => u && u.trim() !== "");
  const imageUrl = !imgError && rawUrl ? rawUrl : PLACEHOLDER;
  const fuelColor =
    FUEL_COLORS[vehicle.fuel_type] || "bg-slate-100 text-slate-600";

  return (
    <div
      className={`group relative flex flex-col overflow-hidden rounded-2xl border bg-white transition-all duration-200 hover:-translate-y-1 hover:shadow-card-lg ${
        selected
          ? "border-brand-400 shadow-glow ring-2 ring-brand-200"
          : "border-surface-200 shadow-card hover:border-surface-300"
      }`}
    >
      {/* Selected badge */}
      {selected && (
        <div className="absolute left-3 top-3 z-10 flex items-center gap-1 rounded-full bg-brand-600 px-2.5 py-1 text-xs font-bold text-white shadow-sm animate-scale-in">
          <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
          Selected
        </div>
      )}

      {/* Image */}
      <div className="relative h-48 w-full overflow-hidden bg-surface-100">
        {rawUrl && !imgError ? (
          <img
            src={imageUrl}
            alt={vehicle.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-surface-100 to-surface-200">
            <svg
              className="h-16 w-16 text-slate-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 2h10l2-2zM13 6l3 5h3l1 2v3h-2"
              />
            </svg>
            <span className="text-xs font-medium text-slate-400">No Image</span>
          </div>
        )}
        {/* Fuel badge */}
        <div
          className={`absolute right-3 top-3 rounded-full px-2.5 py-1 text-xs font-semibold shadow-sm ${fuelColor}`}
        >
          {vehicle.fuel_type || "N/A"}
        </div>
        {/* Gradient overlay */}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/30 to-transparent" />
        {/* Price on image */}
        <div className="absolute bottom-2 left-3">
          <span className="text-sm font-bold text-white drop-shadow">
            Rs. {vehicle.price?.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <h3 className="font-bold text-slate-900 leading-tight line-clamp-1">
            {vehicle.name}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">{vehicle.brand}</p>
        </div>

        {/* Specs grid */}
        <div className="grid grid-cols-2 gap-1.5">
          {[
            { icon: "⛽", label: "Mileage", value: `${vehicle.mileage} km/l` },
            { icon: "⚙️", label: "Engine", value: vehicle.engine || "N/A" },
            {
              icon: "🔧",
              label: "Trans.",
              value: vehicle.transmission || "N/A",
            },
            { icon: "📅", label: "Type", value: vehicle.fuel_type || "N/A" },
          ].map(({ icon, label, value }) => (
            <div key={label} className="rounded-lg bg-surface-50 px-2.5 py-2">
              <p className="text-[10px] text-slate-400 leading-none">
                {icon} {label}
              </p>
              <p className="mt-0.5 text-xs font-semibold text-slate-700 truncate">
                {value}
              </p>
            </div>
          ))}
        </div>

        {/* Features preview */}
        {vehicle.features?.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {vehicle.features.slice(0, 3).map((f, i) => (
              <span
                key={i}
                className="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-medium text-brand-600"
              >
                {f}
              </span>
            ))}
            {vehicle.features.length > 3 && (
              <span className="rounded-full bg-surface-100 px-2 py-0.5 text-[10px] text-slate-400">
                +{vehicle.features.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="mt-auto flex gap-2 pt-1">
          <Link
            to={`/vehicles/${vehicle._id}`}
            className="btn-secondary btn-sm flex-1 text-center"
          >
            Details
          </Link>
          {onFavorite && (
            <button
              onClick={() => onFavorite(vehicle._id)}
              className="btn-icon btn-sm border border-amber-200 bg-amber-50 text-amber-600 hover:bg-amber-100"
              title="Save to favorites"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          )}
          {onCompareToggle && (
            <button
              onClick={() => onCompareToggle(vehicle._id)}
              className={`btn-sm rounded-xl px-3 font-semibold transition-all ${
                selected
                  ? "bg-brand-600 text-white hover:bg-brand-700"
                  : "border border-brand-200 bg-brand-50 text-brand-700 hover:bg-brand-100"
              }`}
            >
              {selected ? "✓" : "+"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
