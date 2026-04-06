import { Link } from "react-router-dom";

const FEATURES = [
  { icon: "⚖️", title: "Side-by-Side Comparison", desc: "Compare 2–3 vehicles on price, mileage, engine, features and more in one clear report." },
  { icon: "🔍", title: "Advanced Search & Filters", desc: "Filter by brand, fuel type, transmission, price range and mileage to find exactly what you need." },
  { icon: "🔩", title: "Accessory Suggestions", desc: "Get the best accessories recommended for your selected vehicle automatically." },
  { icon: "⭐", title: "Real User Reviews", desc: "Read honest ratings and feedback from other buyers before making your decision." },
  { icon: "♥", title: "Save Favorites", desc: "Bookmark vehicles you love and come back to them anytime from your favorites list." },
  { icon: "�", title: "Admin Notifications", desc: "Stay updated with the latest announcements and new vehicle listings from the admin." },
];

const STEPS = [
  { step: "01", title: "Browse Vehicles", desc: "Search and filter from our full vehicle catalog." },
  { step: "02", title: "Select 2–3 Cars", desc: "Pick the vehicles you want to compare side by side." },
  { step: "03", title: "Get Your Report", desc: "Instantly see differences, advantages, and recommendations." },
];

export default function HomePage() {
  return (
    <div className="space-y-20 animate-fade-in">

      {/* ── Hero ── */}
      <section className="relative overflow-hidden rounded-3xl bg-hero px-8 py-16 text-white shadow-card-lg">
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
          <p className="mt-4 max-w-lg text-base text-white/70 md:text-lg">
            Compare 2–3 vehicles side by side, explore detailed specs, read real reviews, and make smarter buying decisions — all in one place.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/vehicles"
              className="rounded-2xl bg-white px-7 py-3.5 text-sm font-bold text-brand-700 shadow-card-md transition hover:bg-brand-50 active:scale-[0.97]"
            >
              Browse Vehicles →
            </Link>
            <Link
              to="/compare"
              className="rounded-2xl border border-white/30 bg-white/10 px-7 py-3.5 text-sm font-bold text-white backdrop-blur transition hover:bg-white/20 active:scale-[0.97]"
            >
              Compare Now ⚖️
            </Link>
          </div>
        </div>

        <div className="relative z-10 mt-10 flex flex-wrap gap-2">
          {["Side-by-side comparison", "Smart recommendations", "Real user reviews", "Save favorites"].map((f) => (
            <span key={f} className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs text-white/70 backdrop-blur">
              ✓ {f}
            </span>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="space-y-8">
        <div className="text-center">
          <h2 className="text-2xl font-black text-slate-900">How It Works</h2>
          <p className="mt-2 text-slate-500">Three simple steps to your perfect car decision</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-3">
          {STEPS.map(({ step, title, desc }) => (
            <div key={step} className="card p-6 text-center space-y-3">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600 text-lg font-black text-white">
                {step}
              </div>
              <p className="font-bold text-slate-900">{title}</p>
              <p className="text-sm text-slate-500">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section className="space-y-8">
        <div className="text-center">
          <h2 className="text-2xl font-black text-slate-900">Everything You Need</h2>
          <p className="mt-2 text-slate-500">Built to help you make the best car buying decision</p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon, title, desc }) => (
            <div key={title} className="card p-5 space-y-2 hover:shadow-card-md transition-shadow">
              <div className="text-3xl">{icon}</div>
              <p className="font-bold text-slate-900">{title}</p>
              <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="rounded-3xl bg-hero px-8 py-12 text-center text-white shadow-card-lg">
        <h2 className="text-2xl font-black md:text-3xl">Ready to find your perfect car?</h2>
        <p className="mt-3 text-white/70">Browse our full catalog and start comparing today.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link to="/vehicles" className="rounded-2xl bg-white px-8 py-3.5 text-sm font-bold text-brand-700 transition hover:bg-brand-50">
            Browse Vehicles →
          </Link>
          <Link to="/register" className="rounded-2xl border border-white/30 bg-white/10 px-8 py-3.5 text-sm font-bold text-white transition hover:bg-white/20">
            Create Free Account
          </Link>
        </div>
      </section>

    </div>
  );
}
