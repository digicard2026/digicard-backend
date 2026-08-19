const adminService = require("../services/admin-service");

exports.getDashboardStats = async (req, res) => {
  try {
    const stats = await adminService.dashboardStats();
    res.status(200).json(stats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllFranchises = async (req, res) => {
  try {
    const data = await adminService.getFranchises();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllPartners = async (req, res) => {
  try {
    const data = await adminService.getPartners();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllCustomers = async (req, res) => {
  try {
    const data = await adminService.getCustomers();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllTransactions = async (req, res) => {
  try {
    const data = await adminService.getTransactions();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getRecentActivity = async (req, res) => {
  try {
    const data = await adminService.getRecentActivity();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
