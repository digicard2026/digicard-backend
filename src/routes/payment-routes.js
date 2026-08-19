const express = require("express");
const router = express.Router();
const {
  createOrder,
  verifyPayment,
  createSubscriptionOrder,
  verifyAndActivate,
  cancelSubscription
} = require("../controllers/payment-controller");

const auth = require("../middlewares/auth-middleware");

// Your existing routes (no auth required)
router.post("/create-order", createOrder);
router.post("/verify", verifyPayment);

// New routes with authentication
router.post("/create-subscription-order", auth, createSubscriptionOrder);
router.post("/verify-and-activate", auth, verifyAndActivate);
router.post("/cancel", auth, cancelSubscription);

module.exports = router;