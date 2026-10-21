const express = require("express");
const router = express.Router();
const Plan = require("../models/plan.model");
const { buildPlanDocuments } = require("../scripts/seedPlans");

// Seed or reset plans
router.post("/seed", async (req, res) => {
  try {
    const defaultPlans = buildPlanDocuments();
    await Plan.deleteMany({});
    const result = await Plan.insertMany(defaultPlans);
    res.status(201).json({
      success: true,
      message: "8 Plans (Monthly & Yearly) seeded successfully into database",
      count: result.length,
      data: result,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all plans (with optional duration or category filter)
router.get("/", async (req, res) => {
  try {
    const defaultPlans = buildPlanDocuments();
    for (const p of defaultPlans) {
      await Plan.findOneAndUpdate(
        { name: p.name, duration: p.duration },
        { 
          $set: {
            allowedFields: p.allowedFields,
            features: p.features,
            requiredFields: p.requiredFields,
            displayName: p.displayName,
            category: p.category,
            categoryGroup: p.categoryGroup,
            price: p.price,
            monthlyPrice: p.monthlyPrice,
            yearlyPrice: p.yearlyPrice,
            availableAddons: p.availableAddons,
            isActive: true
          }
        },
        { upsert: true, new: true }
      );
    }

    const { duration, category, name } = req.query;
    const filter = { isActive: true };

    if (duration) filter.duration = duration;
    if (category && category.toLowerCase() !== "all") {
      filter.$or = [
        { category: category.toLowerCase() },
        { categoryGroup: category.toLowerCase() }
      ];
    }
    if (name) filter.name = new RegExp(`^${name}$`, 'i');

    const plans = await Plan.find(filter).sort({ price: 1 });
    res.json(plans);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get plan by ID
router.get("/:id", async (req, res) => {
  try {
    const plan = await Plan.findById(req.params.id);
    if (!plan) {
      return res.status(404).json({ success: false, message: "Plan not found" });
    }
    res.json(plan);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
