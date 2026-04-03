import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-hero px-4">
      <div className="text-center animate-fade-in">
        <p className="text-8xl font-black text-white/20">404</p>
        <h1 className="mt-4 text-3xl font-black text-white">Page not found</h1>
        <p className="mt-2 text-white/60">
          The page you're looking for doesn't exist.
        </p>
        <Link
          to="/"
          className="mt-8 inline-block rounded-2xl bg-white px-8 py-3.5 text-sm font-bold text-brand-700 shadow-card-md hover:bg-brand-50 transition"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
