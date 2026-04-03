const Accessory = require("../models/Accessory");
const AdminLog = require("../models/AdminLog");
const mongoose = require("mongoose");

const createAccessory = async (req, res) => {
  try {
    const { vehicle_id, name, price, description } = req.body;

    if (!vehicle_id || !name || price === undefined || price === null) {
      return res
        .status(400)
        .json({ message: "vehicle_id, name, and price are required" });
    }

    if (!mongoose.Types.ObjectId.isValid(vehicle_id)) {
      return res.status(400).json({ message: "Invalid vehicle_id" });
    }

    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice < 0) {
      return res
        .status(400)
        .json({ message: "Price must be a non-negative number" });
    }

    const accessory = await Accessory.create({
      vehicle_id,
      name: name.trim(),
      price: numPrice,
      description: description?.trim() || "",
    });

    if (req.user?._id) {
      await AdminLog.create({
        admin_id: req.user._id,
        action: `Created accessory: ${name}`,
      });
    }

    res.status(201).json(accessory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAccessories = async (req, res) => {
  try {
    const { vehicleId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(vehicleId)) {
      return res.status(400).json({ message: "Invalid vehicle ID" });
    }

    const accessories = await Accessory.find({ vehicle_id: vehicleId }).sort({
      createdAt: -1,
    });
    res.json(accessories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteAccessory = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid accessory ID" });
    }

    const accessory = await Accessory.findById(req.params.id);

    if (!accessory) {
      return res.status(404).json({ message: "Accessory not found" });
    }

    await accessory.deleteOne();

    if (req.user?._id) {
      await AdminLog.create({
        admin_id: req.user._id,
        action: `Deleted accessory: ${accessory.name}`,
      });
    }

    res.json({ message: "Accessory deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createAccessory, getAccessories, deleteAccessory };
