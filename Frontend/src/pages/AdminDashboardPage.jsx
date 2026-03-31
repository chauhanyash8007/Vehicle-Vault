import { useEffect, useState } from "react";
import { api, formatApiError } from "../api/client";

export default function AdminDashboardPage() {
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [error, setError] = useState("");
  const [notification, setNotification] = useState({ title: "", message: "" });
  const [newVehicle, setNewVehicle] = useState({
    name: "",
    brand: "",
    price: "",
    fuel_type: "",
    mileage: "",
    engine: "",
    transmission: "",
    features: "",
    specifications: "",
    images: []
  });

  async function loadAdminData() {
    setError("");
    try {
      const [a, u, l, v] = await Promise.all([
        api.get("/api/admin/analytics"),
        api.get("/api/admin/users"),
        api.get("/api/admin/logs"),
        api.get("/api/vehicles")
      ]);
      setAnalytics(a.data);
      setUsers(u.data);
      setLogs(l.data);
      setVehicles(v.data);
    } catch (err) {
      setError(formatApiError(err, "Admin data load failed"));
    }
  }

  useEffect(() => {
    loadAdminData();
  }, []);

  async function blockUser(userId) {
    try {
      await api.put(`/api/admin/block/${userId}`);
      await loadAdminData();
    } catch (err) {
      setError(formatApiError(err, "Block user failed"));
    }
  }

  async function deleteVehicle(vehicleId) {
    try {
      await api.delete(`/api/vehicles/${vehicleId}`);
      await loadAdminData();
    } catch (err) {
      setError(formatApiError(err, "Delete vehicle failed"));
    }
  }

  async function createVehicle(e) {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("name", newVehicle.name);
      formData.append("brand", newVehicle.brand);
      formData.append("price", newVehicle.price);
      formData.append("fuel_type", newVehicle.fuel_type);
      formData.append("mileage", newVehicle.mileage);
      formData.append("engine", newVehicle.engine);
      formData.append("transmission", newVehicle.transmission);
      formData.append("features", JSON.stringify(newVehicle.features.split(",").map((item) => item.trim()).filter(Boolean)));
      let parsedSpecs = {};
      try {
        parsedSpecs = newVehicle.specifications ? JSON.parse(newVehicle.specifications) : {};
      } catch (err) {
        parsedSpecs = {};
      }
      formData.append("specifications", JSON.stringify(parsedSpecs));
      for (const image of newVehicle.images) {
        formData.append("images", image);
      }

      await api.post("/api/vehicles", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      setNewVehicle({
        name: "",
        brand: "",
        price: "",
        fuel_type: "",
        mileage: "",
        engine: "",
        transmission: "",
        features: "",
        specifications: "",
        images: []
      });
      await loadAdminData();
    } catch (err) {
      setError(formatApiError(err, "Create vehicle failed"));
    }
  }

  async function postNotification(e) {
    e.preventDefault();
    try {
      await api.post("/api/notifications", notification);
      setNotification({ title: "", message: "" });
      await loadAdminData();
    } catch (err) {
      setError(formatApiError(err, "Create notification failed"));
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
      {error && <p className="text-sm text-red-600">{error}</p>}

      <section className="grid gap-3 md:grid-cols-3 lg:grid-cols-5">
        {analytics &&
          Object.entries(analytics).map(([key, value]) => (
            <div key={key} className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs uppercase text-slate-500">{key}</p>
              <p className="text-xl font-bold text-slate-900">{value}</p>
            </div>
          ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="mb-3 text-lg font-semibold">Users</h2>
          <ul className="space-y-2 text-sm">
            {users.map(user => (
              <li key={user._id} className="flex items-center justify-between rounded-md bg-slate-50 p-2">
                <span>
                  {user.name} ({user.role}) {user.isBlocked ? "- blocked" : ""}
                </span>
                {user.role !== "admin" && !user.isBlocked && (
                  <button
                    onClick={() => blockUser(user._id)}
                    className="rounded bg-rose-600 px-3 py-1 text-xs text-white"
                  >
                    Block
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>

        <form onSubmit={postNotification} className="rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="mb-3 text-lg font-semibold">Post Notification</h2>
          <input
            placeholder="Title"
            value={notification.title}
            onChange={e => setNotification(prev => ({ ...prev, title: e.target.value }))}
            className="mb-2 w-full rounded-md border border-slate-300 p-2 text-sm"
          />
          <textarea
            rows={3}
            placeholder="Message"
            value={notification.message}
            onChange={e => setNotification(prev => ({ ...prev, message: e.target.value }))}
            className="w-full rounded-md border border-slate-300 p-2 text-sm"
          />
          <button className="mt-3 rounded-md bg-brand-600 px-4 py-2 text-sm text-white">
            Publish
          </button>
        </form>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="mb-3 text-lg font-semibold">Vehicle Inventory</h2>
          <div className="space-y-2 text-sm">
            {vehicles.map(vehicle => (
              <div key={vehicle._id} className="flex items-center justify-between rounded-md bg-slate-50 p-2">
                <span>
                  {vehicle.name} ({vehicle.brand}) - Rs. {vehicle.price}
                </span>
                <button
                  onClick={() => deleteVehicle(vehicle._id)}
                  className="rounded bg-rose-600 px-3 py-1 text-xs text-white"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={createVehicle} className="rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="mb-3 text-lg font-semibold">Add New Vehicle</h2>
          <div className="grid gap-2 md:grid-cols-2">
            <input placeholder="Name" value={newVehicle.name} onChange={e => setNewVehicle(prev => ({ ...prev, name: e.target.value }))} className="rounded-md border border-slate-300 p-2 text-sm" />
            <input placeholder="Brand" value={newVehicle.brand} onChange={e => setNewVehicle(prev => ({ ...prev, brand: e.target.value }))} className="rounded-md border border-slate-300 p-2 text-sm" />
            <input placeholder="Price" type="number" value={newVehicle.price} onChange={e => setNewVehicle(prev => ({ ...prev, price: e.target.value }))} className="rounded-md border border-slate-300 p-2 text-sm" />
            <input placeholder="Fuel Type" value={newVehicle.fuel_type} onChange={e => setNewVehicle(prev => ({ ...prev, fuel_type: e.target.value }))} className="rounded-md border border-slate-300 p-2 text-sm" />
            <input placeholder="Mileage" type="number" value={newVehicle.mileage} onChange={e => setNewVehicle(prev => ({ ...prev, mileage: e.target.value }))} className="rounded-md border border-slate-300 p-2 text-sm" />
            <input placeholder="Engine" value={newVehicle.engine} onChange={e => setNewVehicle(prev => ({ ...prev, engine: e.target.value }))} className="rounded-md border border-slate-300 p-2 text-sm" />
            <input placeholder="Transmission" value={newVehicle.transmission} onChange={e => setNewVehicle(prev => ({ ...prev, transmission: e.target.value }))} className="rounded-md border border-slate-300 p-2 text-sm" />
            <input placeholder="Features (comma separated)" value={newVehicle.features} onChange={e => setNewVehicle(prev => ({ ...prev, features: e.target.value }))} className="rounded-md border border-slate-300 p-2 text-sm" />
            <textarea placeholder="Specifications (JSON)" rows={3} value={newVehicle.specifications} onChange={e => setNewVehicle(prev => ({ ...prev, specifications: e.target.value }))} className="col-span-2 rounded-md border border-slate-300 p-2 text-sm" />
            <input type="file" multiple onChange={e => setNewVehicle(prev => ({ ...prev, images: Array.from(e.target.files) }))} className="col-span-2 rounded-md border border-slate-300 p-2 text-sm" />
          </div>
          <button className="mt-3 rounded-md bg-brand-600 px-4 py-2 text-sm text-white">Save Vehicle</button>
        </form>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="mb-3 text-lg font-semibold">Admin Logs</h2>
        <ul className="space-y-2 text-sm">
          {logs.map(log => (
            <li key={log._id} className="rounded-md bg-slate-50 p-2">
              {log.action}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
