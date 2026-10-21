const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../../.env") });

const Plan = require("../models/plan.model");
const cardFieldsConfig = require("../config/cardFieldsConfig");

const planPricingMap = {
  Personal: {
    monthly: 500,
    yearly: 3500,
    displayName: "DI - Individuals",
    category: "personal",
    categoryGroup: "individual",
    badge: null
  },
  Business: {
    monthly: 800,
    yearly: 6800,
    displayName: "DI - Working Professional",
    category: "business",
    categoryGroup: "individual",
    badge: "Most Popular"
  },
  BusinessPremium: {
    monthly: 1200,
    yearly: 8200,
    displayName: "DI - Service Providers",
    category: "business premium",
    categoryGroup: "individual",
    badge: "Best for Services"
  },
  Professionals: {
    monthly: 1500,
    yearly: 12000,
    displayName: "DI - Professionals",
    category: "professionals",
    categoryGroup: "individual",
    badge: "Executive"
  },
  ProfessionalPro: {
    monthly: 1800,
    yearly: 14400,
    displayName: "DI - Professional Pro",
    category: "professionalpro",
    categoryGroup: "individual",
    badge: "Specialized"
  },
  Entrepreneurials: {
    monthly: 1800,
    yearly: 15000,
    displayName: "DI - Entrepreneurials",
    category: "entrepreneurials",
    categoryGroup: "business",
    badge: null
  },
  EntrepreneurialsMulti: {
    monthly: 2200,
    yearly: 18000,
    displayName: "DI - Multi-Activities",
    category: "entrepreneurialsmulti",
    categoryGroup: "business",
    badge: "Multi-Venture"
  },
  CorporateBusiness: {
    monthly: 2500,
    yearly: 22000,
    displayName: "DI - Business",
    category: "corporatebusiness",
    categoryGroup: "business",
    badge: "Enterprise"
  },
  Team: {
    monthly: 2800,
    yearly: 24000,
    displayName: "DI - Team",
    category: "team",
    categoryGroup: "business",
    badge: "Multi-User"
  },
  MiniWebsite: {
    monthly: 3000,
    yearly: 27000,
    displayName: "DP - Mini Website",
    category: "miniwebsite",
    categoryGroup: "business",
    badge: "Complete Suite"
  }
};

const buildPlanDocuments = () => {
  const planDocs = [];

  for (const [key, config] of Object.entries(cardFieldsConfig)) {
    const meta = planPricingMap[key] || {
      monthly: 1000,
      yearly: 9000,
      displayName: config.name || key,
      category: key.toLowerCase(),
      categoryGroup: "individual",
      badge: null
    };

    // Monthly Document
    planDocs.push({
      name: config.name || key,
      displayName: meta.displayName,
      category: meta.category,
      categoryGroup: meta.categoryGroup,
      description: config.description || "",
      badge: meta.badge,
      duration: "monthly",
      durationDays: 30,
      price: meta.monthly,
      monthlyPrice: meta.monthly,
      yearlyPrice: meta.yearly,
      requiredFields: config.required || ["firstName", "email"],
      allowedFields: config.allowed || [],
      features: config.features || [],
      availableAddons: config.addons || [],
      isActive: true
    });

    // Yearly Document
    planDocs.push({
      name: config.name || key,
      displayName: meta.displayName,
      category: meta.category,
      categoryGroup: meta.categoryGroup,
      description: config.description || "",
      badge: meta.badge,
      duration: "yearly",
      durationDays: 365,
      price: meta.yearly,
      monthlyPrice: meta.monthly,
      yearlyPrice: meta.yearly,
      requiredFields: config.required || ["firstName", "email"],
      allowedFields: config.allowed || [],
      features: config.features || [],
      availableAddons: config.addons || [],
      isActive: true
    });
  }

  return planDocs;
};

const seedPlans = async () => {
  try {
    const dbUrl = process.env.DB_URL;
    if (!dbUrl) {
      throw new Error("DB_URL is not defined in environment variables");
    }

    console.log("Connecting to MongoDB...");
    await mongoose.connect(dbUrl);
    console.log("Connected to MongoDB.");

    const plans = buildPlanDocuments();
    console.log(`Seeding ${plans.length} plans (8 Monthly + 8 Yearly)...`);

    await Plan.deleteMany({});
    const inserted = await Plan.insertMany(plans);

    console.log(`Successfully seeded ${inserted.length} plans.`);
    process.exit(0);
  } catch (error) {
    console.error("Error seeding plans:", error);
    process.exit(1);
  }
};

if (require.main === module) {
  seedPlans();
}

module.exports = { seedPlans, buildPlanDocuments };
