import { Link } from "react-router-dom";

export default function VehicleCard({ vehicle, onCompareToggle, selected, onFavorite }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{vehicle.name}</h3>
          <p className="text-sm text-slate-600">{vehicle.brand}</p>
        </div>
        <span className="rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-700">
          {vehicle.fuel_type}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm text-slate-700">
        <p>Price: Rs. {vehicle.price}</p>
        <p>Mileage: {vehicle.mileage} km/l</p>
        <p>Engine: {vehicle.engine || "N/A"}</p>
        <p>Trans: {vehicle.transmission || "N/A"}</p>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          to={`/vehicles/${vehicle._id}`}
          className="rounded-md border border-slate-200 px-3 py-2 text-sm hover:bg-slate-100"
        >
          View Details
        </Link>
        {onFavorite && (
          <button
            onClick={() => onFavorite(vehicle._id)}
            className="rounded-md border border-slate-200 px-3 py-2 text-sm hover:bg-slate-100"
          >
            Save Favorite
          </button>
        )}
        {onCompareToggle && (
          <button
            onClick={() => onCompareToggle(vehicle._id)}
            className={`rounded-md px-3 py-2 text-sm ${
              selected ? "bg-brand-600 text-white" : "border border-slate-200 hover:bg-slate-100"
            }`}
          >
            {selected ? "Selected" : "Compare"}
          </button>
        )}
      </div>
    </div>
  );
}
