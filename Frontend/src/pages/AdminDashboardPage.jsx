import { useEffect, useState } from "react";
import { api, formatApiError } from "../api/client";
import { useToast } from "../components/Toast";

const TABS = [
  { id: "Analytics", icon: "📊" },
  { id: "Users", icon: "👥" },
  { id: "Vehicles", icon: "🚗" },
  { id: "Accessories", icon: "🔩" },
  { id: "Notifications", icon: "🔔" },
  { id: "Logs", icon: "📋" },
];

const EV = {
  name: "",
  brand: "",
  price: "",
  fuel_type: "",
  mileage: "",
  engine: "",
  transmission: "",
  features: "",
  specifications: "",
  images: [],
  imageUrls: "",
};
const EA = { vehicle_id: "", name: "", price: "", description: "" };

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl rounded-3xl bg-white shadow-card-lg overflow-y-auto max-h-[90vh] animate-scale-in">
        <div className="flex items-center justify-between border-b border-surface-200 px-6 py-4">
          <h2 className="font-bold text-slate-900">{title}</h2>
          <button
            onClick={onClose}
            className="btn-icon btn-ghost text-slate-400"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

function VehicleForm({ data, onChange, onSubmit, submitLabel }) {
  return (
    <form onSubmit={onSubmit} className="grid gap-3 sm:grid-cols-2">
      {[
        ["name", "Name *", true],
        ["brand", "Brand *", true],
        ["engine", "Engine", false],
        ["transmission", "Transmission", false],
      ].map(([f, ph, req]) => (
        <input
          key={f}
          required={req}
          placeholder={ph}
          value={data[f] || ""}
          onChange={(e) => onChange(f, e.target.value)}
          className="input"
        />
      ))}
      <input
        required
        type="number"
        placeholder="Price (Rs.) *"
        value={data.price || ""}
        onChange={(e) => onChange("price", e.target.value)}
        className="input"
      />
      <input
        required
        type="number"
        placeholder="Mileage (km/l) *"
        value={data.mileage || ""}
        onChange={(e) => onChange("mileage", e.target.value)}
        className="input"
      />
      <input
        required
        placeholder="Fuel Type *"
        value={data.fuel_type || ""}
        onChange={(e) => onChange("fuel_type", e.target.value)}
        className="input"
      />
      <input
        placeholder="Features (comma separated)"
        value={
          Array.isArray(data.features)
            ? data.features.join(", ")
            : data.features || ""
        }
        onChange={(e) => onChange("features", e.target.value)}
        className="input"
      />
      <textarea
        placeholder='Specifications JSON e.g. {"hp":"150hp","torque":"200Nm"}'
        rows={2}
        value={
          typeof data.specifications === "object"
            ? JSON.stringify(data.specifications)
            : data.specifications || ""
        }
        onChange={(e) => onChange("specifications", e.target.value)}
        className="input col-span-2 resize-none"
      />

      {/* Image URLs — easiest way to add images */}
      <div className="col-span-2 space-y-2">
        <label className="label">
          Image URLs{" "}
          <span className="text-slate-400 font-normal">
            (comma-separated, recommended)
          </span>
        </label>
        <textarea
          rows={2}
          placeholder="https://example.com/car1.jpg, https://example.com/car2.jpg"
          value={data.imageUrls || ""}
          onChange={(e) => onChange("imageUrls", e.target.value)}
          className="input resize-none font-mono text-xs"
        />
      </div>

      {/* File upload — alternative to URLs */}
      <div className="col-span-2 space-y-1">
        <label className="label">
          Or Upload Image Files{" "}
          <span className="text-slate-400 font-normal">
            (overrides URLs if selected)
          </span>
        </label>
        <input
          type="file"
          multiple
          accept="image/*"
          className="input text-sm"
          onChange={(e) => onChange("images", Array.from(e.target.files))}
        />
      </div>

      {/* Preview URLs if entered */}
      {data.imageUrls && (
        <div className="col-span-2 flex flex-wrap gap-2">
          {data.imageUrls.split(",").map(
            (u, i) =>
              u.trim() && (
                <img
                  key={i}
                  src={u.trim()}
                  alt="preview"
                  className="h-16 w-24 rounded-lg object-cover border border-surface-200"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              ),
          )}
        </div>
      )}

      <button type="submit" className="btn-primary col-span-2">
        {submitLabel}
      </button>
    </form>
  );
}

export default function AdminDashboardPage() {
  const toast = useToast();
  const [tab, setTab] = useState("Analytics");
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [accessories, setAccessories] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [logs, setLogs] = useState([]);
  const [notifForm, setNotifForm] = useState({ title: "", message: "" });
  const [newVehicle, setNewVehicle] = useState(EV);
  const [editVehicle, setEditVehicle] = useState(null);
  const [newAccessory, setNewAccessory] = useState(EA);
  const [showAddVehicle, setShowAddVehicle] = useState(false);

  async function loadAll() {
    setLoading(true);
    try {
      const [a, u, v, n, l] = await Promise.allSettled([
        api.get("/api/admin/analytics"),
        api.get("/api/admin/users"),
        api.get("/api/vehicles", { params: { limit: 50 } }),
        api.get("/api/notifications"),
        api.get("/api/admin/logs"),
      ]);

      if (a.status === "fulfilled") setAnalytics(a.value.data);
      if (u.status === "fulfilled")
        setUsers(Array.isArray(u.value.data) ? u.value.data : []);
      if (v.status === "fulfilled") {
        const vd = v.value.data;
        setVehicles(Array.isArray(vd) ? vd : vd?.data || []);
      }
      if (n.status === "fulfilled")
        setNotifications(Array.isArray(n.value.data) ? n.value.data : []);
      if (l.status === "fulfilled") {
        const ld = l.value.data;
        setLogs(
          Array.isArray(ld?.logs) ? ld.logs : Array.isArray(ld) ? ld : [],
        );
      }

      const failed = [a, u, v, n, l].filter((r) => r.status === "rejected");
      if (failed.length) {
        toast(
          formatApiError(failed[0].reason, "Some data failed to load"),
          "warning",
        );
      }
    } catch (err) {
      toast(formatApiError(err, "Failed to load data"), "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  async function blockUser(id) {
    try {
      await api.put(`/api/admin/block/${id}`);
      toast("User blocked");
      await loadAll();
    } catch (err) {
      toast(formatApiError(err, "Failed"), "error");
    }
  }
  async function unblockUser(id) {
    try {
      await api.put(`/api/admin/unblock/${id}`);
      toast("User unblocked");
      await loadAll();
    } catch (err) {
      toast(formatApiError(err, "Failed"), "error");
    }
  }
  async function deleteUser(id) {
    if (!window.confirm("Delete this user?")) return;
    try {
      await api.delete(`/api/admin/users/${id}`);
      toast("User deleted");
      await loadAll();
    } catch (err) {
      toast(formatApiError(err, "Failed"), "error");
    }
  }

  function buildVehicleFormData(data) {
    const fd = new FormData();
    [
      "name",
      "brand",
      "price",
      "fuel_type",
      "mileage",
      "engine",
      "transmission",
    ].forEach((f) => fd.append(f, data[f] || ""));
    const feats =
      typeof data.features === "string"
        ? data.features
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : data.features || [];
    fd.append("features", JSON.stringify(feats));
    let specs = {};
    try {
      specs =
        typeof data.specifications === "string"
          ? JSON.parse(data.specifications)
          : data.specifications || {};
    } catch {
      specs = {};
    }
    fd.append("specifications", JSON.stringify(specs));
    // File uploads take priority; otherwise send imageUrls
    if (data.images?.length) {
      data.images.forEach((img) => fd.append("images", img));
    } else if (data.imageUrls?.trim()) {
      fd.append("imageUrls", data.imageUrls.trim());
    }
    return fd;
  }

  async function createVehicle(e) {
    e.preventDefault();
    try {
      await api.post("/api/vehicles", buildVehicleFormData(newVehicle), {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast("Vehicle created");
      setNewVehicle(EV);
      setShowAddVehicle(false);
      await loadAll();
    } catch (err) {
      toast(formatApiError(err, "Failed"), "error");
    }
  }

  async function saveEdit(e) {
    e.preventDefault();
    try {
      await api.put(
        `/api/vehicles/${editVehicle._id}`,
        buildVehicleFormData(editVehicle),
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      toast("Vehicle updated");
      setEditVehicle(null);
      await loadAll();
    } catch (err) {
      toast(formatApiError(err, "Failed"), "error");
    }
  }

  async function deleteVehicle(id) {
    if (!window.confirm("Delete this vehicle?")) return;
    try {
      await api.delete(`/api/vehicles/${id}`);
      toast("Vehicle deleted");
      await loadAll();
    } catch (err) {
      toast(formatApiError(err, "Failed"), "error");
    }
  }

  async function loadAccessories(vehicleId) {
    try {
      const { data } = await api.get(`/api/accessories/${vehicleId}`);
      setAccessories(data);
    } catch (err) {
      toast(formatApiError(err, "Failed"), "error");
    }
  }

  async function createAccessory(e) {
    e.preventDefault();
    try {
      await api.post("/api/accessories", {
        ...newAccessory,
        price: Number(newAccessory.price),
      });
      toast("Accessory created");
      if (newAccessory.vehicle_id) loadAccessories(newAccessory.vehicle_id);
      setNewAccessory(EA);
    } catch (err) {
      toast(formatApiError(err, "Failed"), "error");
    }
  }

  async function deleteAccessory(id) {
    try {
      await api.delete(`/api/accessories/${id}`);
      toast("Deleted");
      setAccessories((p) => p.filter((a) => a._id !== id));
    } catch (err) {
      toast(formatApiError(err, "Failed"), "error");
    }
  }

  async function postNotification(e) {
    e.preventDefault();
    try {
      await api.post("/api/notifications", notifForm);
      toast("Published");
      setNotifForm({ title: "", message: "" });
      await loadAll();
    } catch (err) {
      toast(formatApiError(err, "Failed"), "error");
    }
  }

  async function deleteNotification(id) {
    try {
      await api.delete(`/api/notifications/${id}`);
      toast("Deleted");
      setNotifications((p) => p.filter((n) => n._id !== id));
    } catch (err) {
      toast(formatApiError(err, "Failed"), "error");
    }
  }

  const STAT_META = {
    users: { icon: "👤", color: "text-brand-600", bg: "bg-brand-50" },
    admins: { icon: "⚙️", color: "text-violet-600", bg: "bg-violet-50" },
    blockedUsers: { icon: "🚫", color: "text-rose-600", bg: "bg-rose-50" },
    vehicles: { icon: "🚗", color: "text-emerald-600", bg: "bg-emerald-50" },
    reviews: { icon: "⭐", color: "text-amber-600", bg: "bg-amber-50" },
    favorites: { icon: "♥", color: "text-pink-600", bg: "bg-pink-50" },
    comparisons: { icon: "⚖️", color: "text-teal-600", bg: "bg-teal-50" },
    notifications: { icon: "🔔", color: "text-indigo-600", bg: "bg-indigo-50" },
    accessories: { icon: "🔩", color: "text-orange-600", bg: "bg-orange-50" },
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {editVehicle && (
        <Modal title="Edit Vehicle" onClose={() => setEditVehicle(null)}>
          <VehicleForm
            data={editVehicle}
            onChange={(f, v) => setEditVehicle((p) => ({ ...p, [f]: v }))}
            onSubmit={saveEdit}
            submitLabel="Save Changes"
          />
        </Modal>
      )}
      {showAddVehicle && (
        <Modal title="Add New Vehicle" onClose={() => setShowAddVehicle(false)}>
          <VehicleForm
            data={newVehicle}
            onChange={(f, v) => setNewVehicle((p) => ({ ...p, [f]: v }))}
            onSubmit={createVehicle}
            submitLabel="Add Vehicle"
          />
        </Modal>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-black text-slate-900">
            Admin Dashboard
          </h1>
          <p className="section-sub">Manage your VehicleVault platform</p>
        </div>
        <button onClick={loadAll} className="btn-secondary btn-sm gap-1.5">
          <svg
            className="h-3.5 w-3.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Refresh
        </button>
      </div>

      {/* Tab bar */}
      <div className="flex flex-wrap gap-1 rounded-2xl border border-surface-200 bg-white p-1.5 shadow-card">
        {TABS.map(({ id, icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-medium transition-all ${tab === id ? "bg-brand-600 text-white shadow-sm" : "text-slate-600 hover:bg-surface-100"}`}
          >
            <span>{icon}</span>
            {id}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-surface-200 border-t-brand-600" />
        </div>
      ) : (
        <>
          {tab === "Analytics" && analytics && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Object.entries(analytics).map(([key, value]) => {
                const m = STAT_META[key] || {
                  icon: "📌",
                  color: "text-slate-600",
                  bg: "bg-slate-50",
                };
                return (
                  <div key={key} className="stat-card">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        {key.replace(/([A-Z])/g, " $1").trim()}
                      </p>
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-xl ${m.bg} text-base`}
                      >
                        {m.icon}
                      </div>
                    </div>
                    <p className={`text-4xl font-black ${m.color}`}>{value}</p>
                  </div>
                );
              })}
            </div>
          )}

          {tab === "Users" && (
            <div className="card overflow-hidden">
              <div className="flex items-center justify-between border-b border-surface-200 px-5 py-4">
                <h2 className="font-bold text-slate-900">
                  Users ({users.length})
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="table-base">
                  <thead>
                    <tr className="border-b border-surface-200 bg-surface-50 px-5">
                      <th className="px-5 pb-3 pt-4">Name</th>
                      <th className="px-5 pb-3 pt-4">Email</th>
                      <th className="px-5 pb-3 pt-4">Role</th>
                      <th className="px-5 pb-3 pt-4">Status</th>
                      <th className="px-5 pb-3 pt-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u._id}>
                        <td className="px-5">
                          <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
                              {u.name?.[0]?.toUpperCase()}
                            </div>
                            <span className="font-medium text-slate-800">
                              {u.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 text-slate-500">{u.email}</td>
                        <td className="px-5">
                          <span
                            className={
                              u.role === "admin" ? "badge-brand" : "badge-slate"
                            }
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="px-5">
                          <span
                            className={
                              u.isBlocked ? "badge-red" : "badge-green"
                            }
                          >
                            {u.isBlocked ? "Blocked" : "Active"}
                          </span>
                        </td>
                        <td className="px-5">
                          {u.role !== "admin" && (
                            <div className="flex gap-2">
                              {u.isBlocked ? (
                                <button
                                  onClick={() => unblockUser(u._id)}
                                  className="btn-success btn-sm"
                                >
                                  Unblock
                                </button>
                              ) : (
                                <button
                                  onClick={() => blockUser(u._id)}
                                  className="btn-sm rounded-xl bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-600 transition"
                                >
                                  Block
                                </button>
                              )}
                              <button
                                onClick={() => deleteUser(u._id)}
                                className="btn-danger btn-sm"
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === "Vehicles" && (
            <div className="space-y-5">
              <div className="card overflow-hidden">
                <div className="flex items-center justify-between border-b border-surface-200 px-5 py-4">
                  <h2 className="font-bold text-slate-900">
                    Inventory ({vehicles.length})
                  </h2>
                  <button
                    onClick={() => setShowAddVehicle(true)}
                    className="btn-primary btn-sm"
                  >
                    + Add Vehicle
                  </button>
                </div>
                <div className="divide-y divide-surface-100">
                  {vehicles.map((v) => (
                    <div
                      key={v._id}
                      className="flex items-center gap-4 px-5 py-3 hover:bg-surface-50 transition"
                    >
                      <div className="h-12 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-surface-100">
                        <img
                          src={
                            v.images?.[0] ||
                            "https://placehold.co/64x48/e2e8f0/94a3b8?text=VV"
                          }
                          alt={v.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-800 truncate">
                          {v.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {v.brand} · {v.fuel_type} · Rs.{" "}
                          {v.price?.toLocaleString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            setEditVehicle({
                              ...v,
                              imageUrls: v.images?.join(", ") || "",
                            })
                          }
                          className="btn-secondary btn-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteVehicle(v._id)}
                          className="btn-danger btn-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                  {vehicles.length === 0 && (
                    <p className="px-5 py-8 text-center text-sm text-slate-400">
                      No vehicles yet.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {tab === "Accessories" && (
            <div className="grid gap-5 lg:grid-cols-2">
              <div className="card p-5">
                <h2 className="section-title mb-4">Add Accessory</h2>
                <form onSubmit={createAccessory} className="space-y-3">
                  <select
                    required
                    value={newAccessory.vehicle_id}
                    onChange={(e) => {
                      setNewAccessory((p) => ({
                        ...p,
                        vehicle_id: e.target.value,
                      }));
                      if (e.target.value) loadAccessories(e.target.value);
                    }}
                    className="input"
                  >
                    <option value="">Select Vehicle *</option>
                    {vehicles.map((v) => (
                      <option key={v._id} value={v._id}>
                        {v.name} ({v.brand})
                      </option>
                    ))}
                  </select>
                  <input
                    required
                    placeholder="Accessory Name *"
                    value={newAccessory.name}
                    onChange={(e) =>
                      setNewAccessory((p) => ({ ...p, name: e.target.value }))
                    }
                    className="input"
                  />
                  <input
                    required
                    type="number"
                    placeholder="Price *"
                    value={newAccessory.price}
                    onChange={(e) =>
                      setNewAccessory((p) => ({ ...p, price: e.target.value }))
                    }
                    className="input"
                  />
                  <textarea
                    placeholder="Description"
                    rows={2}
                    value={newAccessory.description}
                    onChange={(e) =>
                      setNewAccessory((p) => ({
                        ...p,
                        description: e.target.value,
                      }))
                    }
                    className="input resize-none"
                  />
                  <button type="submit" className="btn-primary w-full">
                    Add Accessory
                  </button>
                </form>
              </div>
              <div className="card p-5">
                <h2 className="section-title mb-4">
                  Accessories ({accessories.length})
                </h2>
                {accessories.length === 0 ? (
                  <p className="text-sm text-slate-400 py-4 text-center">
                    Select a vehicle to view accessories
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {accessories.map((a) => (
                      <li
                        key={a._id}
                        className="flex items-center justify-between rounded-xl bg-surface-50 p-3"
                      >
                        <div>
                          <p className="font-semibold text-slate-800 text-sm">
                            {a.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {a.description} · Rs. {a.price?.toLocaleString()}
                          </p>
                        </div>
                        <button
                          onClick={() => deleteAccessory(a._id)}
                          className="btn-danger btn-sm"
                        >
                          Delete
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}

          {tab === "Notifications" && (
            <div className="grid gap-5 lg:grid-cols-2">
              <div className="card p-5">
                <h2 className="section-title mb-4">Post Notification</h2>
                <form onSubmit={postNotification} className="space-y-3">
                  <input
                    required
                    placeholder="Title *"
                    value={notifForm.title}
                    onChange={(e) =>
                      setNotifForm((p) => ({ ...p, title: e.target.value }))
                    }
                    className="input"
                  />
                  <textarea
                    required
                    rows={4}
                    placeholder="Message *"
                    value={notifForm.message}
                    onChange={(e) =>
                      setNotifForm((p) => ({ ...p, message: e.target.value }))
                    }
                    className="input resize-none"
                  />
                  <button type="submit" className="btn-primary w-full">
                    Publish Notification
                  </button>
                </form>
              </div>
              <div className="card p-5">
                <h2 className="section-title mb-4">
                  All Notifications ({notifications.length})
                </h2>
                <ul className="space-y-2 max-h-96 overflow-y-auto pr-1">
                  {notifications.map((n) => (
                    <li
                      key={n._id}
                      className="flex items-start justify-between gap-3 rounded-xl bg-surface-50 p-3"
                    >
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-800 text-sm truncate">
                          {n.title}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                          {n.message}
                        </p>
                      </div>
                      <button
                        onClick={() => deleteNotification(n._id)}
                        className="btn-danger btn-sm flex-shrink-0"
                      >
                        Delete
                      </button>
                    </li>
                  ))}
                  {notifications.length === 0 && (
                    <p className="text-sm text-slate-400 py-4 text-center">
                      No notifications yet.
                    </p>
                  )}
                </ul>
              </div>
            </div>
          )}

          {tab === "Logs" && (
            <div className="card overflow-hidden">
              <div className="border-b border-surface-200 px-5 py-4">
                <h2 className="font-bold text-slate-900">
                  Admin Logs ({logs.length})
                </h2>
              </div>
              <ul className="divide-y divide-surface-100 max-h-[60vh] overflow-y-auto">
                {logs.map((log) => (
                  <li
                    key={log._id}
                    className="flex items-start justify-between gap-4 px-5 py-3 hover:bg-surface-50 transition"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
                        {log.admin_id?.name?.[0]?.toUpperCase() || "A"}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-800">
                          {log.action}
                        </p>
                        <p className="text-xs text-slate-400">
                          {log.admin_id?.name} · {log.admin_id?.email}
                        </p>
                      </div>
                    </div>
                    <span className="flex-shrink-0 text-xs text-slate-400 whitespace-nowrap">
                      {log.created_at
                        ? new Date(log.created_at).toLocaleString()
                        : ""}
                    </span>
                  </li>
                ))}
                {logs.length === 0 && (
                  <p className="px-5 py-8 text-center text-sm text-slate-400">
                    No logs yet.
                  </p>
                )}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}
