import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api, formatApiError } from "../api/client";
import { useAuth } from "../state/AuthContext";
import { useToast } from "../components/Toast";
import AIRecommendations from "../components/AIRecommendations";

const PH = "https://placehold.co/800x450/e2e8f0/94a3b8?text=No+Image";

function Stars({ value, onChange, size = "text-xl" }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onChange?.(s)}
          className={`${size} transition-transform ${onChange ? "hover:scale-110 cursor-pointer" : "cursor-default"} ${s <= value ? "text-amber-400" : "text-slate-200"}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

function SpecItem({ label, value, icon }) {
  return (
    <div className="flex flex-col gap-1 rounded-xl bg-surface-50 p-3.5">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
        {icon} {label}
      </p>
      <p className="text-sm font-bold text-slate-800">{value}</p>
    </div>
  );
}

export default function VehicleDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const toast = useToast();

  const [vehicle, setVehicle] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [recs, setRecs] = useState({ similarVehicles: [], accessories: [] });
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeImg, setActiveImg] = useState(0);
  const [favorited, setFavorited] = useState(false);

  async function loadAll() {
    setLoading(true);
    try {
      const [vr, rr, rec] = await Promise.allSettled([
        api.get(`/api/vehicles/${id}`),
        api.get(`/api/reviews/${id}`),
        api.get(`/api/vehicles/${id}/recommendations`),
      ]);

      if (vr.status === "fulfilled") {
        setVehicle(vr.value.data);
      } else {
        toast(formatApiError(vr.reason, "Failed to load vehicle"), "error");
      }

      if (rr.status === "fulfilled") {
        setReviews(Array.isArray(rr.value.data) ? rr.value.data : []);
      }

      if (rec.status === "fulfilled") {
        setRecs(rec.value.data || { similarVehicles: [], accessories: [] });
      }
    } catch (err) {
      toast(formatApiError(err, "Failed to load vehicle"), "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, [id]);

  async function submitReview(e) {
    e.preventDefault();
    if (!isLoggedIn) {
      toast("Sign in to review", "warning");
      return navigate("/login");
    }
    setSubmitting(true);
    try {
      await api.post("/api/reviews", { vehicle_id: id, rating, comment });
      setComment("");
      setRating(5);
      toast("Review submitted!");
      await loadAll();
    } catch (err) {
      toast(formatApiError(err, "Review failed"), "error");
    } finally {
      setSubmitting(false);
    }
  }

  async function addFavorite() {
    if (!isLoggedIn) {
      toast("Sign in to save favorites", "warning");
      return navigate("/login");
    }
    try {
      await api.post("/api/favorites", { vehicle_id: id });
      setFavorited(true);
      toast("Saved to favorites ♥");
    } catch (err) {
      toast(formatApiError(err, "Could not save"), "error");
    }
  }

  if (loading)
    return (
      <div className="space-y-5 animate-pulse">
        <div className="h-8 w-48 skeleton" />
        <div className="h-96 skeleton rounded-3xl" />
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="h-64 skeleton" />
          <div className="h-64 skeleton" />
        </div>
      </div>
    );

  if (!vehicle)
    return (
      <div className="card flex flex-col items-center gap-3 py-20 text-center">
        <span className="text-5xl">🚗</span>
        <p className="font-semibold text-slate-700">Vehicle not found</p>
        <Link to="/" className="btn-primary btn-sm">
          Back to vehicles
        </Link>
      </div>
    );

  const images = vehicle.images?.length ? vehicle.images : [PH];
  const avgRating = reviews.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-slate-400">
        <Link to="/" className="hover:text-brand-600 transition">
          Vehicles
        </Link>
        <span>/</span>
        <span className="text-slate-700 font-medium">{vehicle.name}</span>
      </nav>

      {/* ── Main section ── */}
      <section className="card overflow-hidden">
        <div className="grid lg:grid-cols-5">
          {/* Images — 3 cols */}
          <div className="lg:col-span-3 bg-surface-100">
            <div className="relative aspect-video overflow-hidden">
              <img
                src={images[activeImg]}
                alt={vehicle.name}
                className="h-full w-full object-cover transition-all duration-300"
                onError={(e) => {
                  e.target.src = PH;
                }}
              />
              {/* Nav arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setActiveImg(
                        (i) => (i - 1 + images.length) % images.length,
                      )
                    }
                    className="absolute left-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur hover:bg-black/60 transition"
                  >
                    ‹
                  </button>
                  <button
                    onClick={() => setActiveImg((i) => (i + 1) % images.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur hover:bg-black/60 transition"
                  >
                    ›
                  </button>
                </>
              )}
              <div className="absolute bottom-3 right-3 rounded-full bg-black/40 px-2.5 py-1 text-xs text-white backdrop-blur">
                {activeImg + 1} / {images.length}
              </div>
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto p-3 no-scrollbar">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`h-16 w-24 flex-shrink-0 overflow-hidden rounded-xl border-2 transition ${i === activeImg ? "border-brand-500 shadow-glow" : "border-transparent opacity-60 hover:opacity-100"}`}
                  >
                    <img
                      src={img}
                      alt=""
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.target.src = PH;
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details — 2 cols */}
          <div className="flex flex-col gap-5 p-6 lg:col-span-2">
            <div>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h1 className="text-2xl font-black text-slate-900">
                    {vehicle.name}
                  </h1>
                  <p className="text-slate-500">{vehicle.brand}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-2xl font-black text-brand-600">
                    Rs. {vehicle.price?.toLocaleString()}
                  </p>
                  {avgRating > 0 && (
                    <div className="flex items-center justify-end gap-1 mt-1">
                      <Stars value={Math.round(avgRating)} size="text-sm" />
                      <span className="text-xs text-slate-500">
                        ({reviews.length})
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <SpecItem
                icon="⛽"
                label="Fuel Type"
                value={vehicle.fuel_type || "N/A"}
              />
              <SpecItem
                icon="📊"
                label="Mileage"
                value={`${vehicle.mileage} km/l`}
              />
              <SpecItem
                icon="⚙️"
                label="Engine"
                value={vehicle.engine || "N/A"}
              />
              <SpecItem
                icon="🔧"
                label="Transmission"
                value={vehicle.transmission || "N/A"}
              />
            </div>

            {vehicle.features?.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Features
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {vehicle.features.map((f, i) => (
                    <span key={i} className="badge-brand">
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {vehicle.specifications &&
              Object.keys(vehicle.specifications).length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Specifications
                  </p>
                  <div className="grid grid-cols-2 gap-1.5 text-xs">
                    {Object.entries(vehicle.specifications).map(([k, v]) => (
                      <div
                        key={k}
                        className="rounded-lg bg-surface-50 px-3 py-2"
                      >
                        <span className="text-slate-400 capitalize">{k}:</span>
                        <span className="ml-1 font-semibold text-slate-700">
                          {String(v)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            <div className="mt-auto flex gap-2">
              <button
                onClick={addFavorite}
                disabled={favorited}
                className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition ${favorited ? "bg-amber-100 text-amber-700 border border-amber-200" : "border border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100"}`}
              >
                {favorited ? "♥ Saved" : "♥ Save to Favorites"}
              </button>
              <Link
                to="/compare"
                state={{ selected: [id] }}
                className="btn-secondary rounded-xl px-4 py-2.5 text-sm"
              >
                ⚖️ Compare
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Recommendations ── */}
      <section className="grid gap-5 lg:grid-cols-2">
        <div className="card p-5">
          <h2 className="section-title mb-4">Similar Vehicles</h2>
          {recs.similarVehicles?.length === 0 ? (
            <p className="text-sm text-slate-400 py-4 text-center">
              No similar vehicles found
            </p>
          ) : (
            <ul className="space-y-2">
              {recs.similarVehicles.map((v) => (
                <li key={v._id}>
                  <Link
                    to={`/vehicles/${v._id}`}
                    className="flex items-center gap-3 rounded-xl p-3 hover:bg-surface-50 transition group"
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
                      <p className="font-semibold text-slate-800 group-hover:text-brand-600 transition truncate">
                        {v.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {v.brand} · {v.fuel_type}
                      </p>
                    </div>
                    <span className="flex-shrink-0 font-bold text-brand-600 text-sm">
                      Rs. {v.price?.toLocaleString()}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card p-5">
          <h2 className="section-title mb-4">Related Accessories</h2>
          {recs.accessories?.length === 0 ? (
            <p className="text-sm text-slate-400 py-4 text-center">
              No accessories found
            </p>
          ) : (
            <ul className="space-y-2">
              {recs.accessories.map((a) => (
                <li
                  key={a._id}
                  className="flex items-center justify-between rounded-xl bg-surface-50 p-3"
                >
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">
                      {a.name}
                    </p>
                    {a.description && (
                      <p className="text-xs text-slate-500 mt-0.5">
                        {a.description}
                      </p>
                    )}
                  </div>
                  <span className="flex-shrink-0 font-bold text-emerald-600 text-sm ml-3">
                    Rs. {a.price?.toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* ── AI Recommendations ── */}
      <AIRecommendations vehicleId={id} />

      {/* ── Reviews ── */}
      <section className="grid gap-5 lg:grid-cols-2">
        <form onSubmit={submitReview} className="card p-6">
          <h2 className="section-title mb-5">Write a Review</h2>
          <div className="mb-4">
            <p className="label">Your Rating</p>
            <Stars value={rating} onChange={setRating} size="text-3xl" />
          </div>
          <textarea
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="input resize-none"
            placeholder="Share your experience with this vehicle..."
          />
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary mt-4 w-full"
          >
            {submitting ? "Submitting..." : "Submit Review"}
          </button>
        </form>

        <div className="card p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="section-title">Reviews ({reviews.length})</h2>
            {avgRating > 0 && (
              <div className="flex items-center gap-2 rounded-xl bg-amber-50 px-3 py-1.5">
                <span className="text-xl font-black text-amber-500">
                  {avgRating.toFixed(1)}
                </span>
                <Stars value={Math.round(avgRating)} size="text-sm" />
              </div>
            )}
          </div>
          {reviews.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <span className="text-3xl">💬</span>
              <p className="text-sm text-slate-500">
                No reviews yet — be the first!
              </p>
            </div>
          ) : (
            <ul className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {reviews.map((r) => (
                <li
                  key={r._id}
                  className="rounded-xl border border-surface-100 bg-surface-50 p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
                        {r.user_id?.name?.[0]?.toUpperCase() || "U"}
                      </div>
                      <p className="text-sm font-semibold text-slate-800">
                        {r.user_id?.name || "Anonymous"}
                      </p>
                    </div>
                    <Stars value={r.rating} size="text-sm" />
                  </div>
                  {r.comment && (
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {r.comment}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
