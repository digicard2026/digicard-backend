const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin-controller");
const auth = require("../middlewares/auth-middleware");
const { isAdmin } = require("../middlewares/auth-middleware");

// Require authentication and admin privileges for all admin routes
router.use(auth, isAdmin);

router.get("/dashboard-stats", adminController.getDashboardStats);
router.get("/franchises", adminController.getAllFranchises);
router.get("/partners", adminController.getAllPartners);
router.get("/customers", adminController.getAllCustomers);
router.get("/transactions", adminController.getAllTransactions);
router.get("/recent-activity", adminController.getRecentActivity);

module.exports = router;

