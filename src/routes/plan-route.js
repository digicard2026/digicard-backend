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
    // Only seed initial default plans if collection is completely empty
    const existingCount = await Plan.countDocuments();
    if (existingCount === 0) {
      const defaultPlans = buildPlanDocuments();
      await Plan.insertMany(defaultPlans);
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

// Create dynamic new plan
router.post("/", async (req, res) => {
  try {
    const planData = req.body;
    const newPlan = new Plan(planData);
    const saved = await newPlan.save();
    res.status(201).json({ success: true, data: saved });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
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

// Update dynamic plan
router.put("/:id", async (req, res) => {
  try {
    const updated = await Plan.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!updated) {
      return res.status(404).json({ success: false, message: "Plan not found" });
    }
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Deactivate or delete plan
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Plan.findByIdAndUpdate(
      req.params.id,
      { $set: { isActive: false } },
      { new: true }
    );
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Plan not found" });
    }
    res.json({ success: true, message: "Plan deactivated successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
