// src/controllers/accessoryController.js

const Accessory = require("../models/Accessory");
const AdminLog = require("../models/AdminLog");

const createAccessory = async (req, res) => {
  try {
    const { vehicle_id, name, price, description } = req.body;

    const accessory = await Accessory.create({
      vehicle_id,
      name,
      price,
      description,
    });

    if (req.user?._id) {
      await AdminLog.create({
        admin_id: req.user._id,
        action: `Created accessory ${name}`
      });
    }

    res.status(201).json(accessory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAccessories = async (req, res) => {
  try {
    const accessories = await Accessory.find({
      vehicle_id: req.params.vehicleId,
    });

    res.json(accessories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createAccessory, getAccessories };
