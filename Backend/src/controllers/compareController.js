// src/controllers/compareController.js

const Vehicle = require("../models/Vehicle");
const Comparison = require("../models/Comparison");
const Accessory = require("../models/Accessory");

const isSameValue = (a, b) => JSON.stringify(a) === JSON.stringify(b);

const getRecommendationsForVehicles = async (vehicleIds) => {
  const uniqueVehicleIds = [...new Set((vehicleIds || []).map(String))];
  if (uniqueVehicleIds.length === 0)
    return { similarVehicles: [], accessories: [] };

  const selectedVehicles = await Vehicle.find({
    _id: { $in: uniqueVehicleIds },
  });
  if (!selectedVehicles.length) return { similarVehicles: [], accessories: [] };

  const brands = selectedVehicles.map((v) => v.brand).filter(Boolean);
  const fuelTypes = selectedVehicles.map((v) => v.fuel_type).filter(Boolean);
  const transmissions = selectedVehicles
    .map((v) => v.transmission)
    .filter(Boolean);

  const avgPrice =
    selectedVehicles.reduce((sum, v) => sum + (Number(v.price) || 0), 0) /
    selectedVehicles.length;

  const priceBand = 500000;

  const similarVehicles = await Vehicle.find({
    _id: { $nin: uniqueVehicleIds },
    price: {
      $gte: Math.max(0, avgPrice - priceBand),
      $lte: avgPrice + priceBand,
    },
    $or: [
      brands.length ? { brand: { $in: brands } } : null,
      fuelTypes.length ? { fuel_type: { $in: fuelTypes } } : null,
      transmissions.length ? { transmission: { $in: transmissions } } : null,
    ].filter(Boolean),
  })
    .limit(6)
    .sort({ createdAt: -1 });

  const similarVehicleIds = similarVehicles.map((v) => v._id);
  const accessories = await Accessory.find({
    vehicle_id: { $in: similarVehicleIds },
  }).limit(20);

  return { similarVehicles, accessories };
};

const compareVehicles = async (req, res) => {
  try {
    const { vehicleIds } = req.body;
    const uniqueVehicleIds = [...new Set((vehicleIds || []).map(String))];

    if (uniqueVehicleIds.length < 2 || uniqueVehicleIds.length > 3) {
      return res.status(400).json({ message: "Select 2-3 vehicles" });
    }

    const vehicles = await Vehicle.find({ _id: { $in: uniqueVehicleIds } });

    if (!vehicles || vehicles.length !== uniqueVehicleIds.length) {
      return res.status(400).json({ message: "Vehicles not found" });
    }

    const differences = [];
    const similarities = [];
    const advantages = [];
    const disadvantages = [];

    // ✅ FIXED KEYS (NO _id, __v, etc.)
    const keys = [
      "name",
      "brand",
      "price",
      "fuel_type",
      "mileage",
      "engine",
      "transmission",
      "features",
      "specifications",
    ];

    keys.forEach((key) => {
      const values = vehicles.map((v) => v[key]);

      const same = values.every((val) => isSameValue(val, values[0]));

      if (same) {
        similarities.push({ field: key, value: values[0] });
      } else {
        differences.push({ field: key, values });
      }
    });

    const byPriceAsc = [...vehicles].sort((a, b) => a.price - b.price);
    const byMileageDesc = [...vehicles].sort((a, b) => b.mileage - a.mileage);

    if (byPriceAsc[0]) {
      advantages.push(
        `${byPriceAsc[0].name} has the lowest price among selected vehicles.`,
      );
      disadvantages.push(
        `${byPriceAsc[byPriceAsc.length - 1].name} has the highest price among selected vehicles.`,
      );
    }

    if (byMileageDesc[0]) {
      advantages.push(
        `${byMileageDesc[0].name} offers the best mileage among selected vehicles.`,
      );
      disadvantages.push(
        `${byMileageDesc[byMileageDesc.length - 1].name} has the lowest mileage among selected vehicles.`,
      );
    }

    const result = {
      differences,
      similarities,
      advantages,
      disadvantages,
      summary: "Comparison completed successfully for selected vehicles",
    };

    const comparison = await Comparison.create({
      user_id: req.user._id,
      vehicles: uniqueVehicleIds,
      result,
    });

    const recommendations =
      await getRecommendationsForVehicles(uniqueVehicleIds);

    return res.json({
      ...comparison.toObject(),
      recommendations,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getComparisonById = async (req, res) => {
  try {
    const comparison = await Comparison.findById(req.params.id)
      .populate("vehicles")
      .populate("user_id", "name email role");

    if (!comparison) {
      return res.status(404).json({ message: "Comparison not found" });
    }

    const isOwner =
      comparison.user_id?._id?.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res
        .status(403)
        .json({ message: "Not authorized to view this comparison" });
    }

    const recommendations = await getRecommendationsForVehicles(
      comparison.vehicles.map((v) => v._id),
    );

    return res.json({
      ...comparison.toObject(),
      recommendations,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { compareVehicles, getComparisonById };
