const Vehicle = require("../models/Vehicle");
const Comparison = require("../models/Comparison");
const Accessory = require("../models/Accessory");

const isSameValue = (a, b) => JSON.stringify(a) === JSON.stringify(b);

const getRecommendationsForVehicles = async (vehicleIds) => {
  try {
    const uniqueIds = [...new Set((vehicleIds || []).map(String))];
    if (!uniqueIds.length) return { similarVehicles: [], accessories: [] };

    const selectedVehicles = await Vehicle.find({ _id: { $in: uniqueIds } });
    if (!selectedVehicles.length)
      return { similarVehicles: [], accessories: [] };

    const brands = [
      ...new Set(selectedVehicles.map((v) => v.brand).filter(Boolean)),
    ];
    const fuelTypes = [
      ...new Set(selectedVehicles.map((v) => v.fuel_type).filter(Boolean)),
    ];
    const transmissions = [
      ...new Set(selectedVehicles.map((v) => v.transmission).filter(Boolean)),
    ];
    const avgPrice =
      selectedVehicles.reduce((s, v) => s + (Number(v.price) || 0), 0) /
      selectedVehicles.length;

    const orConditions = [];
    if (brands.length) orConditions.push({ brand: { $in: brands } });
    if (fuelTypes.length) orConditions.push({ fuel_type: { $in: fuelTypes } });
    if (transmissions.length)
      orConditions.push({ transmission: { $in: transmissions } });
    orConditions.push({
      price: {
        $gte: Math.max(0, avgPrice - 500000),
        $lte: avgPrice + 500000,
      },
    });

    const similarVehicles = await Vehicle.find({
      _id: { $nin: uniqueIds },
      $or: orConditions,
    })
      .limit(6)
      .sort({ createdAt: -1 });

    const similarIds = similarVehicles.map((v) => v._id);
    const accessories = await Accessory.find({
      vehicle_id: { $in: similarIds },
    }).limit(20);

    return { similarVehicles, accessories };
  } catch {
    return { similarVehicles: [], accessories: [] };
  }
};

const compareVehicles = async (req, res) => {
  try {
    const { vehicleIds } = req.body;

    if (
      !Array.isArray(vehicleIds) ||
      vehicleIds.length < 2 ||
      vehicleIds.length > 3
    ) {
      return res
        .status(400)
        .json({ message: "Provide 2–3 vehicle IDs in vehicleIds array" });
    }

    const uniqueVehicleIds = [...new Set(vehicleIds.map(String))];

    if (uniqueVehicleIds.length < 2) {
      return res
        .status(400)
        .json({ message: "Select at least 2 different vehicles" });
    }

    const vehicles = await Vehicle.find({ _id: { $in: uniqueVehicleIds } });

    if (vehicles.length !== uniqueVehicleIds.length) {
      return res.status(404).json({
        message: `${uniqueVehicleIds.length - vehicles.length} vehicle(s) not found. Check the IDs.`,
      });
    }

    const differences = [];
    const similarities = [];
    const advantages = [];
    const disadvantages = [];

    const COMPARE_KEYS = [
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

    COMPARE_KEYS.forEach((key) => {
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

    if (byPriceAsc.length >= 2) {
      advantages.push(
        `${byPriceAsc[0].name} has the lowest price (Rs. ${byPriceAsc[0].price?.toLocaleString()}).`,
      );
      if (byPriceAsc[0].name !== byPriceAsc[byPriceAsc.length - 1].name) {
        disadvantages.push(
          `${byPriceAsc[byPriceAsc.length - 1].name} has the highest price (Rs. ${byPriceAsc[byPriceAsc.length - 1].price?.toLocaleString()}).`,
        );
      }
    }

    if (byMileageDesc.length >= 2) {
      advantages.push(
        `${byMileageDesc[0].name} offers the best mileage (${byMileageDesc[0].mileage} km/l).`,
      );
      if (
        byMileageDesc[0].name !== byMileageDesc[byMileageDesc.length - 1].name
      ) {
        disadvantages.push(
          `${byMileageDesc[byMileageDesc.length - 1].name} has the lowest mileage (${byMileageDesc[byMileageDesc.length - 1].mileage} km/l).`,
        );
      }
    }

    const byFeatureCount = [...vehicles].sort(
      (a, b) => (b.features?.length || 0) - (a.features?.length || 0),
    );
    if (
      byFeatureCount[0]?.features?.length > 0 &&
      byFeatureCount[0].features.length !==
        (byFeatureCount[byFeatureCount.length - 1]?.features?.length || 0)
    ) {
      advantages.push(
        `${byFeatureCount[0].name} has the most features (${byFeatureCount[0].features.length} features listed).`,
      );
    }

    const cheapest = byPriceAsc[0];
    const bestMileage = byMileageDesc[0];
    let summary = `Compared ${vehicles.length} vehicles: ${vehicles.map((v) => v.name).join(", ")}. `;
    summary += `${cheapest.name} is the most affordable at Rs. ${cheapest.price?.toLocaleString()}. `;
    summary += `${bestMileage.name} delivers the best fuel efficiency at ${bestMileage.mileage} km/l. `;
    summary += `${differences.length} specification(s) differ and ${similarities.length} are identical across all vehicles.`;

    const result = {
      differences,
      similarities,
      advantages,
      disadvantages,
      summary,
    };

    const comparison = await Comparison.create({
      user_id: req.user._id,
      vehicles: uniqueVehicleIds,
      result,
    });

    const populated = await Comparison.findById(comparison._id).populate(
      "vehicles",
    );

    const recommendations =
      await getRecommendationsForVehicles(uniqueVehicleIds);

    const directAccessories = await Accessory.find({
      vehicle_id: { $in: uniqueVehicleIds },
    }).limit(15);
    if (directAccessories.length > 0) {
      const existingIds = new Set(
        recommendations.accessories.map((a) => String(a._id)),
      );
      const newOnes = directAccessories.filter(
        (a) => !existingIds.has(String(a._id)),
      );
      recommendations.accessories = [
        ...newOnes,
        ...recommendations.accessories,
      ].slice(0, 20);
    }

    return res.status(201).json({
      ...populated.toObject(),
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

    return res.json({ ...comparison.toObject(), recommendations });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { compareVehicles, getComparisonById };
