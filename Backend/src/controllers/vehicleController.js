// src/controllers/vehicleController.js

const Vehicle = require("../models/Vehicle");
const Accessory = require("../models/Accessory");
const AdminLog = require("../models/AdminLog");

const getVehicles = async (req, res) => {
  try {
    const {
      brand,
      fuel_type,
      transmission,
      minPrice,
      maxPrice,
      minMileage,
      maxMileage,
      q,
      page = 1,
      limit = 10
    } = req.query;

    const filter = {};

    if (brand) filter.brand = new RegExp(`^${brand}$`, "i");
    if (fuel_type) filter.fuel_type = new RegExp(`^${fuel_type}$`, "i");
    if (transmission) filter.transmission = new RegExp(`^${transmission}$`, "i");

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    if (minMileage || maxMileage) {
      filter.mileage = {};
      if (minMileage) filter.mileage.$gte = Number(minMileage);
      if (maxMileage) filter.mileage.$lte = Number(maxMileage);
    }

    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: "i" } },
        { brand: { $regex: q, $options: "i" } },
        { engine: { $regex: q, $options: "i" } }
      ];
    }

    const safeLimit = Math.min(Number(limit) || 10, 50);
    const safePage = Math.max(Number(page) || 1, 1);
    const skip = (safePage - 1) * safeLimit;

    const [vehicles, total] = await Promise.all([
      Vehicle.find(filter).sort({ createdAt: -1 }).skip(skip).limit(safeLimit),
      Vehicle.countDocuments(filter)
    ]);

    if (req.query.withMeta === "true") {
      return res.json({
        data: vehicles,
        pagination: {
          total,
          page: safePage,
          limit: safeLimit,
          totalPages: Math.ceil(total / safeLimit)
        }
      });
    }

    return res.json(vehicles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getVehicleById = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    return res.json(vehicle);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const createVehicle = async (req, res) => {
  try {
    const {
      name,
      brand,
      price,
      fuel_type,
      mileage,
      engine,
      transmission,
      features,
      specifications
    } = req.body;

    // ✅ SAFE IMAGE HANDLING (FINAL FIX)
    const images = req.files
      ? req.files.map(file => file.path)
      : req.file
      ? [req.file.path]
      : [];

    const vehicle = await Vehicle.create({
      name,
      brand,
      price,
      fuel_type,
      mileage,
      engine,
      transmission,
      features,
      specifications,
      images
    });

    if (req.user?._id) {
      await AdminLog.create({
        admin_id: req.user._id,
        action: `Created vehicle ${vehicle.name}`
      });
    }

    res.status(201).json(vehicle);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    Object.assign(vehicle, req.body);
    await vehicle.save();

    if (req.user?._id) {
      await AdminLog.create({
        admin_id: req.user._id,
        action: `Updated vehicle ${vehicle.name}`
      });
    }

    res.json(vehicle);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    await vehicle.deleteOne();

    if (req.user?._id) {
      await AdminLog.create({
        admin_id: req.user._id,
        action: `Deleted vehicle ${vehicle.name}`
      });
    }

    res.json({ message: "Vehicle removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getVehicleRecommendations = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    const similarVehicles = await Vehicle.find({
      _id: { $ne: vehicle._id },
      $or: [
        { brand: vehicle.brand },
        { fuel_type: vehicle.fuel_type },
        { transmission: vehicle.transmission },
        {
          price: {
            $gte: Math.max(0, vehicle.price - 500000),
            $lte: vehicle.price + 500000
          }
        }
      ]
    })
      .limit(6)
      .sort({ createdAt: -1 });

    const accessories = await Accessory.find({ vehicle_id: vehicle._id }).limit(10);

    return res.json({
      vehicle_id: vehicle._id,
      similarVehicles,
      accessories
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  getVehicleRecommendations
};