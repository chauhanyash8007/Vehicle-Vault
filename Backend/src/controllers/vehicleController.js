// src/controllers/vehicleController.js
const Vehicle = require("../models/Vehicle");
const Accessory = require("../models/Accessory");
const AdminLog = require("../models/AdminLog");

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const getVehicles = async (req, res) => {
  try {
    const { brand, fuel_type, transmission, minPrice, maxPrice, minMileage, maxMileage, q, page = 1, limit = 10, withMeta } = req.query;
    const filter = {};
    if (brand) filter.brand = new RegExp(`^${escapeRegex(brand)}`, "i");
    if (fuel_type) filter.fuel_type = new RegExp(`^${escapeRegex(fuel_type)}`, "i");
    if (transmission) filter.transmission = new RegExp(`^${escapeRegex(transmission)}`, "i");
    if (minPrice || maxPrice) { filter.price = {}; if (minPrice) filter.price.$gte = Number(minPrice); if (maxPrice) filter.price.$lte = Number(maxPrice); }
    if (minMileage || maxMileage) { filter.mileage = {}; if (minMileage) filter.mileage.$gte = Number(minMileage); if (maxMileage) filter.mileage.$lte = Number(maxMileage); }
    if (q) { const e = escapeRegex(q); filter.$or = [{ name: { $regex: e, $options: "i" } }, { brand: { $regex: e, $options: "i" } }, { engine: { $regex: e, $options: "i" } }]; }
    const safeLimit = Math.min(Number(limit) || 10, 50);
    const safePage = Math.max(Number(page) || 1, 1);
    const skip = (safePage - 1) * safeLimit;
    const [vehicles, total] = await Promise.all([Vehicle.find(filter).sort({ createdAt: -1 }).skip(skip).limit(safeLimit), Vehicle.countDocuments(filter)]);
    if (withMeta === "true") return res.json({ data: vehicles, pagination: { total, page: safePage, limit: safeLimit, totalPages: Math.ceil(total / safeLimit) } });
    return res.json(vehicles);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const getVehicleById = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) return res.status(404).json({ message: "Vehicle not found" });
    return res.json(vehicle);
  } catch (error) { return res.status(500).json({ message: error.message }); }
};

const createVehicle = async (req, res) => {
  try {
    const { name, brand, price, fuel_type, mileage, engine, transmission, features, specifications, imageUrls } = req.body;
    if (!name || !brand || !price || !fuel_type || !mileage) return res.status(400).json({ message: "name, brand, price, fuel_type, and mileage are required" });
    let images = [];
    if (req.files?.length) images = req.files.map(f => f.path);
    else if (imageUrls) { try { const p = JSON.parse(imageUrls); images = Array.isArray(p) ? p.filter(Boolean) : []; } catch { images = imageUrls.split(",").map(u => u.trim()).filter(Boolean); } }
    let parsedFeatures = features; if (typeof features === "string") { try { parsedFeatures = JSON.parse(features); } catch { parsedFeatures = []; } }
    let parsedSpecs = specifications; if (typeof specifications === "string") { try { parsedSpecs = JSON.parse(specifications); } catch { parsedSpecs = {}; } }
    const vehicle = await Vehicle.create({ name, brand, price: Number(price), fuel_type, mileage: Number(mileage), engine, transmission, features: Array.isArray(parsedFeatures) ? parsedFeatures : [], specifications: (parsedSpecs && typeof parsedSpecs === "object") ? parsedSpecs : {}, images });
    if (req.user?._id) await AdminLog.create({ admin_id: req.user._id, action: `Created vehicle: ${vehicle.name}` });
    res.status(201).json(vehicle);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const updateVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) return res.status(404).json({ message: "Vehicle not found" });
    const updates = { ...req.body };
    if (typeof updates.features === "string") { try { updates.features = JSON.parse(updates.features); } catch { delete updates.features; } }
    if (typeof updates.specifications === "string") { try { updates.specifications = JSON.parse(updates.specifications); } catch { delete updates.specifications; } }
    if (req.files?.length) updates.images = req.files.map(f => f.path);
    else if (updates.imageUrls) { try { const p = JSON.parse(updates.imageUrls); updates.images = Array.isArray(p) ? p.filter(Boolean) : []; } catch { updates.images = updates.imageUrls.split(",").map(u => u.trim()).filter(Boolean); } delete updates.imageUrls; }
    else delete updates.images;
    Object.assign(vehicle, updates);
    await vehicle.save();
    if (req.user?._id) await AdminLog.create({ admin_id: req.user._id, action: `Updated vehicle: ${vehicle.name}` });
    res.json(vehicle);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const deleteVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) return res.status(404).json({ message: "Vehicle not found" });
    await vehicle.deleteOne();
    if (req.user?._id) await AdminLog.create({ admin_id: req.user._id, action: `Deleted vehicle: ${vehicle.name}` });
    res.json({ message: "Vehicle removed" });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const getVehicleRecommendations = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) return res.status(404).json({ message: "Vehicle not found" });
    const orConditions = [];
    if (vehicle.brand) orConditions.push({ brand: vehicle.brand });
    if (vehicle.fuel_type) orConditions.push({ fuel_type: vehicle.fuel_type });
    if (vehicle.transmission) orConditions.push({ transmission: vehicle.transmission });
    orConditions.push({ price: { $gte: Math.max(0, vehicle.price - 500000), $lte: vehicle.price + 500000 } });
    const similarVehicles = await Vehicle.find({ _id: { $ne: vehicle._id }, $or: orConditions }).limit(6).sort({ createdAt: -1 });
    const accessories = await Accessory.find({ vehicle_id: vehicle._id }).limit(10);
    return res.json({ vehicle_id: vehicle._id, similarVehicles, accessories });
  } catch (error) { return res.status(500).json({ message: error.message }); }
};

// ── AI Recommendations — improved scoring engine ──────────────────────────
const getAIRecommendations = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) return res.status(404).json({ message: "Vehicle not found" });

    // Optional filters from query
    const { fuel_type, maxPrice, minMileage, sortBy = "score" } = req.query;

    let query = { _id: { $ne: vehicle._id } };
    if (fuel_type) query.fuel_type = fuel_type;
    if (maxPrice) query.price = { $lte: Number(maxPrice) };
    if (minMileage) query.mileage = { $gte: Number(minMileage) };

    const allVehicles = await Vehicle.find(query);

    const scored = allVehicles.map((v) => {
      let score = 0;
      const breakdown = { brand: 0, fuelType: 0, transmission: 0, price: 0, mileage: 0, features: 0, value: 0 };
      const reasons = [];

      // Brand (25 pts)
      if (v.brand === vehicle.brand) { breakdown.brand = 25; score += 25; reasons.push("Same brand"); }

      // Fuel type (20 pts)
      if (v.fuel_type === vehicle.fuel_type) { breakdown.fuelType = 20; score += 20; reasons.push(`Same fuel type (${v.fuel_type})`); }

      // Transmission (15 pts)
      if (v.transmission && v.transmission === vehicle.transmission) { breakdown.transmission = 15; score += 15; reasons.push(`Same transmission (${v.transmission})`); }

      // Price proximity (20 pts)
      const priceDiff = vehicle.price > 0 ? Math.abs(v.price - vehicle.price) / vehicle.price : 1;
      if (priceDiff <= 0.05) { breakdown.price = 20; score += 20; reasons.push("Nearly identical price"); }
      else if (priceDiff <= 0.10) { breakdown.price = 15; score += 15; reasons.push("Very similar price"); }
      else if (priceDiff <= 0.20) { breakdown.price = 10; score += 10; reasons.push("Similar price range"); }
      else if (priceDiff <= 0.40) { breakdown.price = 5; score += 5; }

      // Mileage proximity (10 pts)
      const mileageDiff = Math.abs(v.mileage - vehicle.mileage);
      if (mileageDiff <= 1) { breakdown.mileage = 10; score += 10; reasons.push("Nearly identical mileage"); }
      else if (mileageDiff <= 2) { breakdown.mileage = 7; score += 7; reasons.push("Similar mileage"); }
      else if (mileageDiff <= 4) { breakdown.mileage = 4; score += 4; }

      // Feature overlap (10 pts)
      const vFeats = new Set((v.features || []).map(f => f.toLowerCase()));
      const baseFeats = (vehicle.features || []).map(f => f.toLowerCase());
      const overlap = baseFeats.filter(f => vFeats.has(f)).length;
      if (overlap >= 4) { breakdown.features = 10; score += 10; reasons.push(`${overlap} shared features`); }
      else if (overlap >= 2) { breakdown.features = 6; score += 6; reasons.push(`${overlap} shared features`); }
      else if (overlap >= 1) { breakdown.features = 3; score += 3; }

      // Better value bonus (5 pts)
      if (v.mileage > vehicle.mileage && v.price < vehicle.price) {
        breakdown.value = 5; score += 5;
        reasons.push(`Better value: ${v.mileage} km/l at Rs. ${v.price.toLocaleString()}`);
      }

      // Seating match bonus (5 pts)
      const vSeating = v.specifications?.seating;
      const baseSeating = vehicle.specifications?.seating;
      if (vSeating && baseSeating && vSeating === baseSeating) {
        score += 5; reasons.push(`Same seating capacity (${vSeating})`);
      }

      // Normalize score to 0-100
      const maxPossible = 110;
      const normalizedScore = Math.round((score / maxPossible) * 100);

      // Tag
      let tag = null;
      if (v.mileage > vehicle.mileage && v.price <= vehicle.price) tag = "best_value";
      else if (v.brand === vehicle.brand && priceDiff <= 0.15) tag = "same_brand";
      else if (v.fuel_type !== vehicle.fuel_type) tag = "alternative_fuel";

      return { vehicle: v, score: normalizedScore, rawScore: score, breakdown, reasons, tag };
    });

    // Sort
    if (sortBy === "price_asc") scored.sort((a, b) => a.vehicle.price - b.vehicle.price);
    else if (sortBy === "price_desc") scored.sort((a, b) => b.vehicle.price - a.vehicle.price);
    else if (sortBy === "mileage") scored.sort((a, b) => b.vehicle.mileage - a.vehicle.mileage);
    else scored.sort((a, b) => b.score - a.score);

    const top = scored.slice(0, 8);
    const topIds = top.map(t => t.vehicle._id);
    const accessories = await Accessory.find({ vehicle_id: { $in: topIds } }).limit(12);

    // Stats summary
    const avgScore = top.length ? Math.round(top.reduce((s, t) => s + t.score, 0) / top.length) : 0;
    const bestValue = [...scored].sort((a, b) => {
      const aRatio = a.vehicle.mileage / (a.vehicle.price / 1000000);
      const bRatio = b.vehicle.mileage / (b.vehicle.price / 1000000);
      return bRatio - aRatio;
    })[0];

    return res.json({
      basedOn: { _id: vehicle._id, name: vehicle.name, brand: vehicle.brand, price: vehicle.price, mileage: vehicle.mileage, fuel_type: vehicle.fuel_type },
      recommendations: top.map(t => ({ ...t.vehicle.toObject(), aiScore: t.score, aiBreakdown: t.breakdown, aiReasons: t.reasons, aiTag: t.tag })),
      accessories,
      meta: { total: scored.length, avgScore, bestValueId: bestValue?.vehicle._id?.toString() },
    });
  } catch (error) { return res.status(500).json({ message: error.message }); }
};

// ── Autocomplete — improved with fuel type counts ─────────────────────────
const getAutocomplete = async (req, res) => {
  try {
    const q = req.query.q?.trim();
    if (!q || q.length < 1) return res.json([]);
    const escaped = escapeRegex(q);
    const regex = { $regex: escaped, $options: "i" };

    const [vehicles, brands] = await Promise.all([
      Vehicle.find({ $or: [{ name: regex }, { brand: regex }] })
        .select("name brand fuel_type price mileage images transmission")
        .limit(8).sort({ createdAt: -1 }),
      Vehicle.distinct("brand", { brand: regex }),
    ]);

    // Get vehicle count per brand for context
    const brandCounts = await Promise.all(
      brands.slice(0, 3).map(async b => {
        const count = await Vehicle.countDocuments({ brand: b });
        return { brand: b, count };
      })
    );

    const suggestions = [
      ...brandCounts.map(({ brand: b, count }) => ({ type: "brand", label: b, value: b, count })),
      ...vehicles.map(v => ({
        type: "vehicle", label: v.name, sublabel: v.brand, value: v.name,
        _id: v._id, image: v.images?.[0] || null, price: v.price,
        fuel_type: v.fuel_type, mileage: v.mileage, transmission: v.transmission,
      })),
    ];

    return res.json(suggestions);
  } catch (error) { return res.status(500).json({ message: error.message }); }
};

module.exports = { getVehicles, getVehicleById, createVehicle, updateVehicle, deleteVehicle, getVehicleRecommendations, getAIRecommendations, getAutocomplete };
