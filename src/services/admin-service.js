const User = require("../models/user.model");
const Franchise = require("../models/franchise-partner.model");
const Payment = require("../models/user-subscription.model");
const Subscription = require("../models/subscriptionPlan.model");

/* Dashboard Stats */
exports.dashboardStats = async () => {
  const totalFranchise = await Franchise.countDocuments();
  const activeFranchise = await Franchise.countDocuments({ isActive: true });
  const pendingFranchise = await Franchise.countDocuments({ "franchiseDetails.status": "pending" });

  const totalPartners = await User.countDocuments({ role: "partner" });
  const activePartners = await User.countDocuments({ role: "partner", isActive: true });

  const totalCustomers = await User.countDocuments({ role: "customer" });
  const activeCustomers = await User.countDocuments({ role: "customer", isActive: true });

  const totalTransactions = await Payment.countDocuments();
  const successTransactions = await Payment.countDocuments({ paymentStatus: "success" });

  const totalVolumeAgg = await Payment.aggregate([
    { $match: { paymentStatus: "success" } },
    { $group: { _id: null, total: { $sum: "$selectedPrice" } } }
  ]);

  const totalVolume = totalVolumeAgg[0]?.total || 0;

  return {
    franchise: {
      total: totalFranchise,
      active: activeFranchise,
      pending: pendingFranchise,
      revenue: `₹${totalVolume}`,
      growth: 0
    },
    partners: {
      total: totalPartners,
      active: activePartners,
      growth: 0
    },
    customers: {
      total: totalCustomers,
      active: activeCustomers,
      growth: 0
    },
    transactions: {
      total: totalTransactions,
      volume: `₹${totalVolume}`,
      successRate: totalTransactions
        ? ((successTransactions / totalTransactions) * 100).toFixed(2)
        : 0,
      growth: 0
    }
  };
};

/* Franchise Table */
exports.getFranchises = async () => {
  const franchises = await Franchise.find();

  return franchises.map((f) => ({
    id: f._id,
    name: f.franchiseDetails.businessName,
    location: `${f.franchiseDetails.city}, ${f.franchiseDetails.state}`,
    status: f.franchiseDetails.status,
    manager: `${f.franchiseDetails.firstName} ${f.franchiseDetails.lastName}`,
    joined: f.createdAt,
    customers: 0,
    cardsIssued: 0,
    revenue: "₹0"
  }));
};

/* Partner Table */
exports.getPartners = async () => {
  const partners = await User.find({ role: "partner" });

  return partners.map((p) => ({
    id: p._id,
    name: p.email,
    type: "Partner",
    status: p.isActive ? "Active" : "Inactive",
    email: p.email,
    joined: p.createdAt
  }));
};

/* Customers Table */
exports.getCustomers = async () => {
  const customers = await User.find({ role: "customer" });

  return customers.map((c) => ({
    id: c._id,
    name: c.email,
    email: c.email,
    status: c.isActive ? "Active" : "Inactive",
    joined: c.createdAt
  }));
};

/* Transactions */
exports.getTransactions = async () => {
  const payments = await Payment.find().sort({ createdAt: -1 }).limit(50);

  return payments.map((p) => ({
    transactionId: p.transactionId,
    amount: p.selectedPrice,
    status: p.paymentStatus,
    createdAt: p.createdAt
  }));
};

/* Recent Activity */
exports.getRecentActivity = async () => {
  const latestUsers = await User.find().sort({ createdAt: -1 }).limit(3);
  const latestPayments = await Payment.find().sort({ createdAt: -1 }).limit(2);

  let activity = [];

  latestUsers.forEach((u) => {
    activity.push({
      user: u.email,
      action: `New ${u.role} registered`,
      time: u.createdAt,
      type: u.role,
      status: "success"
    });
  });

  latestPayments.forEach((p) => {
    activity.push({
      user: p.transactionId,
      action: `Payment of ₹${p.selectedPrice} completed`,
      time: p.createdAt,
      type: "transaction",
      status: p.paymentStatus === "success" ? "success" : "warning"
    });
  });

  return activity.sort((a, b) => new Date(b.time) - new Date(a.time));
};
