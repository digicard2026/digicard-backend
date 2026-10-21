const Addon = require("../models/addon.model");

// Predefined 13 add-ons catalog
const defaultAddons = [
  {
    key: "gallery",
    name: "Photo Gallery",
    description: "High-res image gallery and product portfolio showcase",
    price: 200,
    billingType: "monthly",
    unlockedFields: ["gallery"],
    quotaGrants: { galleryMaxCount: 50 },
    applicablePlans: ["Business", "BusinessPremium", "Professionals", "Entrepreneurials", "CorporateBusiness"],
    isActive: true
  },
  {
    key: "docsbuilder",
    name: "Docs Builder",
    description: "Upload brochures, documents, and downloadable PDFs",
    price: 150,
    billingType: "monthly",
    unlockedFields: ["catalogPDF", "downloads"],
    quotaGrants: { docsMaxCount: 20 },
    applicablePlans: ["Business", "Professionals", "Entrepreneurials", "CorporateBusiness"],
    isActive: true
  },
  {
    key: "profilebuilder",
    name: "Profile / Portfolio Builder",
    description: "Custom branding, badge layout, and executive identity",
    price: 150,
    billingType: "monthly",
    unlockedFields: ["brandLabel", "foundedName"],
    applicablePlans: ["Business", "Professionals", "Entrepreneurials"],
    isActive: true
  },
  {
    key: "portfoliobuilder",
    name: "Portfolio Builder",
    description: "Featured projects, case studies, and product range display",
    price: 200,
    billingType: "monthly",
    unlockedFields: ["servicesProducts", "productRangeDisplay"],
    applicablePlans: ["Professionals", "EntrepreneurialsMulti"],
    isActive: true
  },
  {
    key: "catalogbuilder",
    name: "Catalog Builder",
    description: "Digital product catalogs and brochure showcases",
    price: 200,
    billingType: "monthly",
    unlockedFields: ["catalog", "catalogPDF"],
    applicablePlans: ["Professionals", "Business"],
    isActive: true
  },
  {
    key: "brochurebuilder",
    name: "Brochure Builder",
    description: "Interactive digital brochures and documentation",
    price: 150,
    billingType: "monthly",
    unlockedFields: ["catalogPDF"],
    applicablePlans: ["Professionals"],
    isActive: true
  },
  {
    key: "nfccard",
    name: "NFC Smart Card",
    description: "Custom-printed physical contactless smart business card",
    price: 499,
    billingType: "one-time",
    unlockedFields: ["nfcSettings"],
    quotaGrants: { nfcCardIncluded: true },
    applicablePlans: ["Business", "BusinessPremium", "Professionals", "Entrepreneurials", "CorporateBusiness"],
    isActive: true
  },
  {
    key: "leadgen",
    name: "Lead Generation",
    description: "Capture prospect inquiries with smart interactive webforms",
    price: 250,
    billingType: "monthly",
    unlockedFields: ["interactiveElements"],
    applicablePlans: ["Professionals", "EntrepreneurialsMulti"],
    isActive: true
  },
  {
    key: "leadmanagement",
    name: "Lead Management",
    description: "Lead tracking, inquiry dashboard, and CRM client list",
    price: 200,
    billingType: "monthly",
    unlockedFields: ["clientList"],
    applicablePlans: ["Professionals"],
    isActive: true
  },
  {
    key: "appointmentbooking",
    name: "Appointment Booking",
    description: "Integrated calendar scheduling and customer inquiry slots",
    price: 200,
    billingType: "monthly",
    unlockedFields: ["businessHours"],
    applicablePlans: ["Professionals", "BusinessPremium"],
    isActive: true
  },
  {
    key: "whatsappintegration",
    name: "WhatsApp Integration",
    description: "Instant one-tap WhatsApp messaging and automated chat triggers",
    price: 150,
    billingType: "monthly",
    unlockedFields: ["enableWhatsApp"],
    applicablePlans: ["Personal", "Business", "Professionals"],
    isActive: true
  },
  {
    key: "analytics",
    name: "Advanced Analytics",
    description: "Detailed card view counts, scan counts, and visitor insights",
    price: 150,
    billingType: "monthly",
    unlockedFields: ["analytics"],
    applicablePlans: ["Personal", "Business", "Professionals", "Entrepreneurials"],
    isActive: true
  },
  {
    key: "docsmanager",
    name: "Docs Manager",
    description: "Cloud document vault with secure customer download access",
    price: 150,
    billingType: "monthly",
    unlockedFields: ["downloads"],
    quotaGrants: { docsMaxCount: 20 },
    applicablePlans: ["Professionals", "CorporateBusiness"],
    isActive: true
  }
];

// Seed Addons
exports.seedAddons = async (req, res) => {
  try {
    await Addon.deleteMany({});
    const inserted = await Addon.insertMany(defaultAddons);
    res.status(201).json({
      success: true,
      message: "13 Add-ons catalog seeded successfully",
      count: inserted.length,
      data: inserted
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all active addons
exports.getAllAddons = async (req, res) => {
  try {
    let addons = await Addon.find({ isActive: true });

    // Auto-seed if empty
    if (addons.length === 0) {
      addons = await Addon.insertMany(defaultAddons);
    }

    res.status(200).json({
      success: true,
      count: addons.length,
      data: addons
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get addon by key
exports.getAddonByKey = async (req, res) => {
  try {
    const { key } = req.params;
    const addon = await Addon.findOne({ key: key.toLowerCase(), isActive: true });

    if (!addon) {
      return res.status(404).json({ success: false, message: "Addon not found" });
    }

    res.status(200).json({ success: true, data: addon });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports.defaultAddons = defaultAddons;
