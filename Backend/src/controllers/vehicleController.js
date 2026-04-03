const Vehicle = require("../models/Vehicle");
const Accessory = require("../models/Accessory");
const AdminLog = require("../models/AdminLog");

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

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
      limit = 10,
      withMeta,
    } = req.query;

    const filter = {};

    if (brand) filter.brand = new RegExp(`^${escapeRegex(brand)}`, "i");
    if (fuel_type)
      filter.fuel_type = new RegExp(`^${escapeRegex(fuel_type)}`, "i");
    if (transmission)
      filter.transmission = new RegExp(`^${escapeRegex(transmission)}`, "i");

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
      const escaped = escapeRegex(q);
      filter.$or = [
        { name: { $regex: escaped, $options: "i" } },
        { brand: { $regex: escaped, $options: "i" } },
        { engine: { $regex: escaped, $options: "i" } },
      ];
    }

    const safeLimit = Math.min(Number(limit) || 10, 50);
    const safePage = Math.max(Number(page) || 1, 1);
    const skip = (safePage - 1) * safeLimit;

    const [vehicles, total] = await Promise.all([
      Vehicle.find(filter).sort({ createdAt: -1 }).skip(skip).limit(safeLimit),
      Vehicle.countDocuments(filter),
    ]);

    if (withMeta === "true") {
      return res.json({
        data: vehicles,
        pagination: {
          total,
          page: safePage,
          limit: safeLimit,
          totalPages: Math.ceil(total / safeLimit),
        },
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
    if (!vehicle) return res.status(404).json({ message: "Vehicle not found" });
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
      specifications,
      imageUrls,
    } = req.body;

    if (!name || !brand || !price || !fuel_type || !mileage) {
      return res
        .status(400)
        .json({
          message: "name, brand, price, fuel_type, and mileage are required",
        });
    }

    let images = [];
    if (req.files && req.files.length > 0) {
      images = req.files.map((file) => file.path);
    } else if (imageUrls) {
      try {
        const parsed = JSON.parse(imageUrls);
        images = Array.isArray(parsed) ? parsed.filter(Boolean) : [];
      } catch {
        images = imageUrls
          .split(",")
          .map((u) => u.trim())
          .filter(Boolean);
      }
    }

    let parsedFeatures = features;
    if (typeof features === "string") {
      try {
        parsedFeatures = JSON.parse(features);
      } catch {
        parsedFeatures = [];
      }
    }

    let parsedSpecs = specifications;
    if (typeof specifications === "string") {
      try {
        parsedSpecs = JSON.parse(specifications);
      } catch {
        parsedSpecs = {};
      }
    }

    const vehicle = await Vehicle.create({
      name,
      brand,
      price: Number(price),
      fuel_type,
      mileage: Number(mileage),
      engine,
      transmission,
      features: Array.isArray(parsedFeatures) ? parsedFeatures : [],
      specifications:
        parsedSpecs && typeof parsedSpecs === "object" ? parsedSpecs : {},
      images,
    });

    if (req.user?._id) {
      await AdminLog.create({
        admin_id: req.user._id,
        action: `Created vehicle: ${vehicle.name}`,
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
    if (!vehicle) return res.status(404).json({ message: "Vehicle not found" });

    const updates = { ...req.body };

    if (typeof updates.features === "string") {
      try {
        updates.features = JSON.parse(updates.features);
      } catch {
        delete updates.features;
      }
    }
    if (typeof updates.specifications === "string") {
      try {
        updates.specifications = JSON.parse(updates.specifications);
      } catch {
        delete updates.specifications;
      }
    }

    if (req.files && req.files.length > 0) {
      updates.images = req.files.map((f) => f.path);
    } else if (updates.imageUrls) {
      try {
        const parsed = JSON.parse(updates.imageUrls);
        updates.images = Array.isArray(parsed) ? parsed.filter(Boolean) : [];
      } catch {
        updates.images = updates.imageUrls
          .split(",")
          .map((u) => u.trim())
          .filter(Boolean);
      }
      delete updates.imageUrls;
    } else {
      delete updates.images;
    }

    Object.assign(vehicle, updates);
    await vehicle.save();

    if (req.user?._id) {
      await AdminLog.create({
        admin_id: req.user._id,
        action: `Updated vehicle: ${vehicle.name}`,
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
    if (!vehicle) return res.status(404).json({ message: "Vehicle not found" });

    await vehicle.deleteOne();

    if (req.user?._id) {
      await AdminLog.create({
        admin_id: req.user._id,
        action: `Deleted vehicle: ${vehicle.name}`,
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
    if (!vehicle) return res.status(404).json({ message: "Vehicle not found" });

    const orConditions = [];
    if (vehicle.brand) orConditions.push({ brand: vehicle.brand });
    if (vehicle.fuel_type) orConditions.push({ fuel_type: vehicle.fuel_type });
    if (vehicle.transmission)
      orConditions.push({ transmission: vehicle.transmission });
    orConditions.push({
      price: {
        $gte: Math.max(0, vehicle.price - 500000),
        $lte: vehicle.price + 500000,
      },
    });

    const similarVehicles = await Vehicle.find({
      _id: { $ne: vehicle._id },
      $or: orConditions,
    })
      .limit(6)
      .sort({ createdAt: -1 });

    const accessories = await Accessory.find({ vehicle_id: vehicle._id }).limit(
      10,
    );

    return res.json({ vehicle_id: vehicle._id, similarVehicles, accessories });
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
  getVehicleRecommendations,
};
