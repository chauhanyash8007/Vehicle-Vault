import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api, formatApiError } from "../api/client";

export default function VehicleDetailsPage() {
  const { id } = useParams();
  const [vehicle, setVehicle] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [recommendations, setRecommendations] = useState({ similarVehicles: [], accessories: [] });
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");

  async function loadAll() {
    try {
      const [vehicleRes, reviewRes, recRes] = await Promise.all([
        api.get(`/api/vehicles/${id}`),
        api.get(`/api/reviews/${id}`),
        api.get(`/api/vehicles/${id}/recommendations`)
      ]);
      setVehicle(vehicleRes.data);
      setReviews(reviewRes.data || []);
      setRecommendations(recRes.data || { similarVehicles: [], accessories: [] });
    } catch (err) {
      setError(formatApiError(err, "Failed to load vehicle details"));
    }
  }

  async function submitReview(e) {
    e.preventDefault();
    try {
      await api.post("/api/reviews", { vehicle_id: id, rating: Number(rating), comment });
      setComment("");
      await loadAll();
    } catch (err) {
      setError(formatApiError(err, "Review submission failed"));
    }
  }

  useEffect(() => {
    loadAll();
  }, [id]);

  if (!vehicle) return <p>Loading details...</p>;

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <h1 className="text-2xl font-bold text-slate-900">{vehicle.name}</h1>
        <p className="text-sm text-slate-600">{vehicle.brand}</p>
        <div className="mt-4 grid gap-2 text-sm md:grid-cols-3">
          <p>Price: Rs. {vehicle.price}</p>
          <p>Fuel Type: {vehicle.fuel_type}</p>
          <p>Mileage: {vehicle.mileage} km/l</p>
          <p>Engine: {vehicle.engine || "N/A"}</p>
          <p>Transmission: {vehicle.transmission || "N/A"}</p>
          <p>Features: {(vehicle.features || []).join(", ") || "N/A"}</p>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="mb-3 text-lg font-semibold">Similar Vehicles</h2>
          <ul className="space-y-2 text-sm">
            {recommendations.similarVehicles?.map(v => (
              <li key={v._id} className="rounded-md bg-slate-50 p-2">
                {v.name} - {v.brand}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="mb-3 text-lg font-semibold">Related Accessories</h2>
          <ul className="space-y-2 text-sm">
            {recommendations.accessories?.map(a => (
              <li key={a._id} className="rounded-md bg-slate-50 p-2">
                {a.name} (Rs. {a.price})
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <form onSubmit={submitReview} className="rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="mb-3 text-lg font-semibold">Submit Review</h2>
          <input
            type="number"
            min="1"
            max="5"
            value={rating}
            onChange={e => setRating(e.target.value)}
            className="mb-2 w-full rounded-md border border-slate-300 p-2 text-sm"
          />
          <textarea
            rows={3}
            value={comment}
            onChange={e => setComment(e.target.value)}
            className="w-full rounded-md border border-slate-300 p-2 text-sm"
            placeholder="Write your feedback"
          />
          <button className="mt-3 rounded-md bg-brand-600 px-4 py-2 text-sm text-white">
            Submit
          </button>
        </form>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="mb-3 text-lg font-semibold">Reviews</h2>
          <ul className="space-y-2 text-sm">
            {reviews.map(r => (
              <li key={r._id} className="rounded-md bg-slate-50 p-2">
                <p className="font-medium">{r.user_id?.name || "User"} - {r.rating}/5</p>
                <p>{r.comment}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
