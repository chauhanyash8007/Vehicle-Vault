import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
      <h1 className="text-2xl font-bold text-slate-900">Page Not Found</h1>
      <p className="mt-2 text-slate-600">The page you requested does not exist.</p>
      <Link to="/" className="mt-4 inline-block text-brand-700 hover:underline">
        Go back home
      </Link>
    </div>
  );
}
