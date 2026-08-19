const express = require("express");
const router = express.Router();

const {
  getSubscriptionStatus,
  getSubscriptionDetails,
  getSubscriptionHistory,
  checkSubscriptionEligibility,
  getUserPlanDetails
} = require("../controllers/subscription-controller");

const auth = require("../middlewares/auth-middleware");

// Your existing route
router.get("/status", auth, getSubscriptionStatus);

// New routes
router.get("/details", auth, getSubscriptionDetails);
router.get("/history", auth, getSubscriptionHistory);
router.get("/check-eligibility", auth, checkSubscriptionEligibility);
router.get("/user-plan/:userId", getUserPlanDetails);

module.exports = router;

