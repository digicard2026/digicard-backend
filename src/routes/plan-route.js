const express = require("express");
const router = express.Router();
const Plan = require("../models/plan.model");

// BULK INSERT USING POSTMAN
router.post("/bulk-insert", async (req, res) => {
  try {
    await Plan.deleteMany({});
    const result = await Plan.insertMany(req.body);

    res.status(201).json({
      message: "Plans inserted successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all plans
router.get("/", async (req, res) => {
  try {
    const plans = await Plan.find();
    res.json(plans);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
