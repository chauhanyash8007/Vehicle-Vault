import { Link } from "react-router-dom";

export default function VehicleCard({
  vehicle,
  onCompareToggle,
  selected,
  onFavorite,
}) {
  const imageUrl =
    vehicle.images?.[0] || "https://via.placeholder.com/400x220?text=No+Image";

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl">
      <div className="relative h-44 w-full overflow-hidden bg-slate-100">
        <img
          src={imageUrl}
          alt={vehicle.name}
          className="h-full w-full object-cover"
        />
        <div className="absolute left-2 top-2 rounded-full bg-brand-600 px-3 py-1 text-xs font-semibold text-white">
          {vehicle.fuel_type || "N/A"}
        </div>
      </div>
      <div className="space-y-3 p-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900">{vehicle.name}</h3>
          <p className="text-sm text-slate-600">{vehicle.brand}</p>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-slate-600">
          <div className="rounded-lg bg-slate-50 p-2">
            Price: Rs. {vehicle.price}
          </div>
          <div className="rounded-lg bg-slate-50 p-2">
            Mileage: {vehicle.mileage} km/l
          </div>
          <div className="rounded-lg bg-slate-50 p-2">
            Engine: {vehicle.engine || "N/A"}
          </div>
          <div className="rounded-lg bg-slate-50 p-2">
            Trans: {vehicle.transmission || "N/A"}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            to={`/vehicles/${vehicle._id}`}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            View Details
          </Link>
          {onFavorite && (
            <button
              onClick={() => onFavorite(vehicle._id)}
              className="rounded-lg border border-amber-500 bg-amber-100 px-3 py-2 text-sm font-medium text-amber-700 hover:bg-amber-200"
            >
              Save Favorite
            </button>
          )}
          {onCompareToggle && (
            <button
              onClick={() => onCompareToggle(vehicle._id)}
              className={`rounded-lg px-3 py-2 text-sm font-medium ${
                selected
                  ? "bg-brand-600 text-white"
                  : "border border-slate-300 text-slate-700 hover:bg-slate-100"
              }`}
            >
              {selected ? "Selected" : "Compare"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
