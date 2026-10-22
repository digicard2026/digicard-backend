const mongoose = require("mongoose");
const FranchisePartner = require("../models/franchise-partner.model");
const User = require("../models/user.model");

// -------------------------------------------------
// FUNCTION-BASED SERVICE (EXPORT AT DECLARATION)
// -------------------------------------------------

exports.createFranchisePartner = async (createDto) => {
  try {
    const franchisePartner = new FranchisePartner({
      userId: createDto.userId,
      role: createDto.role,
    });

    if (createDto.role === "franchise") {
      franchisePartner.franchiseDetails = { ...createDto };
    }

    return await franchisePartner.save();
  } catch (error) {
    throw new Error(`Failed to create: ${error.message}`);
  }
};

exports.addPartnerToFranchise = async (franchiseUserId, partnerData) => {
  try {
    const franchise = await FranchisePartner.findOne({
      userId: franchiseUserId,
      role: "franchise",
    });

    if (!franchise) throw new Error("Franchise not found");

    const newPartner = { 
      ...partnerData, 
      partnerId: partnerData.userId || partnerData.partnerId, 
      status: partnerData.status || "pending" 
    };

    franchise.partners.push(newPartner);

    const updated = await franchise.save();
    return updated.partners[updated.partners.length - 1];
  } catch (error) {
    throw new Error(`Failed to add partner: ${error.message}`);
  }
};

exports.getFranchiseWithPartners = async (franchiseUserId) => {
  try {
    const franchise = await FranchisePartner.findOne({
      userId: franchiseUserId,
      role: "franchise",
    });

    if (!franchise) throw new Error("Franchise not found");
    return franchise;
  } catch (error) {
    throw new Error(`Failed to fetch franchise: ${error.message}`);
  }
};

exports.getPartnerFromFranchise = async (franchiseUserId, partnerId) => {
  try {
    const franchise = await FranchisePartner.findOne({
      userId: franchiseUserId,
      role: "franchise",
    });

    if (!franchise) throw new Error("Franchise not found");

    // Search by subdocument _id, or embedded partnerId (User ID)
    const partner = (franchise.partners.id && franchise.partners.id(partnerId)) ||
      franchise.partners.find(
        (p) => p._id?.toString() === partnerId?.toString() || p.partnerId?.toString() === partnerId?.toString()
      );

    if (!partner) throw new Error("Partner not found");

    return partner;
  } catch (error) {
    throw new Error(`Failed to fetch partner: ${error.message}`);
  }
};

exports.saveRegistrationStep = async (stepData) => {
  try {
    const { userId, stepNumber, role, franchiseId } = stepData;

    if (role === "franchise") {
      return await FranchisePartner.findOneAndUpdate(
        { userId },
        {
          $set: {
            role,
            registrationStep: stepNumber,
            "franchiseDetails.registrationStep": stepNumber,
            ...Object.fromEntries(
              Object.entries(stepData).map(([k, v]) => [`franchiseDetails.${k}`, v])
            ),
          },
        },
        { new: true, upsert: true }
      );
    }

    if (role === "partner") {
      const franchise = await FranchisePartner.findOne({ userId: franchiseId });
      if (!franchise) throw new Error("Franchise not found");

      const existingIndex = franchise.partners.findIndex(
        (p) => p.partnerId?.toString() === userId?.toString() || p._id?.toString() === userId?.toString()
      );

      if (existingIndex >= 0) {
        Object.assign(franchise.partners[existingIndex], stepData);
        franchise.partners[existingIndex].registrationStep = stepNumber;
      } else {
        franchise.partners.push({
          partnerId: userId,
          ...stepData,
          status: "pending",
        });
      }

      return await franchise.save();
    }
  } catch (error) {
    throw error;
  }
};

exports.updatePartnerInFranchise = async (franchiseUserId, partnerId, updateData) => {
  try {
    const franchise = await FranchisePartner.findOne({
      userId: franchiseUserId,
      role: "franchise",
    });

    if (!franchise) throw new Error("Franchise not found");

    const partner = (franchise.partners.id && franchise.partners.id(partnerId)) ||
      franchise.partners.find(
        (p) => p._id?.toString() === partnerId?.toString() || p.partnerId?.toString() === partnerId?.toString()
      );

    if (!partner) throw new Error("Partner not found");

    Object.assign(partner, updateData);
    partner.updatedAt = new Date();

    await franchise.save();
    return partner;
  } catch (error) {
    throw new Error(`Failed to update partner: ${error.message}`);
  }
};

exports.updatePartnerStatus = async (franchiseUserId, partnerId, status) => {
  try {
    const franchise = await FranchisePartner.findOne({
      userId: franchiseUserId,
      role: "franchise",
    });

    if (!franchise) throw new Error("Franchise not found");

    const partner = (franchise.partners.id && franchise.partners.id(partnerId)) ||
      franchise.partners.find(
        (p) => p._id?.toString() === partnerId?.toString() || p.partnerId?.toString() === partnerId?.toString()
      );

    if (!partner) throw new Error("Partner not found");

    partner.status = status;
    partner.updatedAt = new Date();

    await franchise.save();
    return partner;
  } catch (error) {
    throw new Error(`Failed to update partner status: ${error.message}`);
  }
};

exports.getFranchiseByUserId = async (userId) => {
  try {
    let franchise = null;
    if (mongoose.Types.ObjectId.isValid(userId)) {
      franchise = await FranchisePartner.findOne({
        $or: [{ userId }, { _id: userId }],
        role: "franchise",
      });
    } else {
      franchise = await FranchisePartner.findOne({ userId, role: "franchise" });
    }

    if (!franchise) {
      franchise = await FranchisePartner.findOne({
        $or: [
          ...(mongoose.Types.ObjectId.isValid(userId) ? [{ userId }, { _id: userId }] : [{ userId }])
        ]
      });
    }

    if (!franchise) throw new Error("Franchise not found");
    return franchise;
  } catch (error) {
    throw new Error(`Failed to fetch franchise: ${error.message}`);
  }
};

exports.removePartnerFromFranchise = async (franchiseUserId, partnerId) => {
  try {
    const franchise = await FranchisePartner.findOne({
      userId: franchiseUserId,
      role: "franchise",
    });

    if (!franchise) throw new Error("Franchise not found");

    franchise.partners = franchise.partners.filter(
      (p) => p._id?.toString() !== partnerId?.toString() && p.partnerId?.toString() !== partnerId?.toString()
    );
    await franchise.save();

    return { message: "Partner removed successfully" };
  } catch (error) {
    throw new Error(`Failed to remove partner: ${error.message}`);
  }
};

exports.getFranchiseStatistics = async (franchiseUserId) => {
  try {
    const franchise = await FranchisePartner.findOne({
      userId: franchiseUserId,
      role: "franchise",
    });

    if (!franchise) throw new Error("Franchise not found");

    return {
      totalPartners: franchise.partners.length,
      pendingPartners: franchise.partners.filter((p) => p.status === "pending").length,
      approvedPartners: franchise.partners.filter((p) => p.status === "approved" || p.status === "active").length,
    };
  } catch (error) {
    throw new Error(`Failed to get statistics: ${error.message}`);
  }
};

exports.getPartnersByFranchise = async (franchiseId) => {
  try {
    const franchise = await FranchisePartner.findOne({
      $or: [
        ...(mongoose.Types.ObjectId.isValid(franchiseId) ? [{ userId: franchiseId }, { _id: franchiseId }] : [{ userId: franchiseId }])
      ]
    });
    if (!franchise) throw new Error("Franchise not found");

    return { partners: franchise.partners || [], total: (franchise.partners || []).length };
  } catch (error) {
    throw new Error(`Failed to fetch partners: ${error.message}`);
  }
};

exports.updateFranchise = async (franchiseId, updateData) => {
  try {
    const updated = await FranchisePartner.findByIdAndUpdate(
      franchiseId,
      updateData,
      { new: true }
    );

    if (!updated) throw new Error("Franchise not found");

    return updated;
  } catch (error) {
    throw new Error(`Failed to update franchise: ${error.message}`);
  }
};

/**
 * Fetch partner profile (supports embedded partner, top-level partner, and fallback User doc)
 */
exports.getPartnerProfile = async (userId) => {
  try {
    let partnerRecord = null;

    // 1. Try finding within embedded partners array in Franchise
    let partnerDoc = null;
    if (mongoose.Types.ObjectId.isValid(userId)) {
      partnerDoc = await FranchisePartner.findOne({
        "partners.partnerId": new mongoose.Types.ObjectId(userId),
      });
    } else {
      partnerDoc = await FranchisePartner.findOne({
        "partners.partnerId": userId,
      });
    }

    if (partnerDoc && partnerDoc.partners) {
      partnerRecord = partnerDoc.partners.find(
        (p) => p.partnerId?.toString() === userId.toString()
      );
    }

    // 2. Try finding top-level FranchisePartner document with role: 'partner'
    if (!partnerRecord) {
      const topLevelPartner = await FranchisePartner.findOne({
        userId: mongoose.Types.ObjectId.isValid(userId) ? new mongoose.Types.ObjectId(userId) : userId,
        role: "partner"
      });
      if (topLevelPartner) {
        partnerRecord = {
          partnerId: topLevelPartner.userId,
          businessName: topLevelPartner.franchiseDetails?.businessName || "Channel Partner",
          phone: topLevelPartner.franchiseDetails?.phone || "",
          email: topLevelPartner.franchiseDetails?.email || "",
          createdAt: topLevelPartner.createdAt
        };
      }
    }

    // 3. Fallback to User document
    if (!partnerRecord) {
      const user = await User.findById(userId);
      if (user) {
        partnerRecord = {
          partnerId: user._id,
          businessName: user.name || "Channel Partner",
          phone: user.phoneNumber || "",
          email: user.email,
          createdAt: user.createdAt
        };
      }
    }

    if (!partnerRecord) {
      throw new Error("Partner not found");
    }

    return {
      userId: partnerRecord.partnerId || userId,
      businessName: partnerRecord.businessName || "Channel Partner",
      phone: partnerRecord.phone || "",
      email: partnerRecord.email || "",
      createdAt: partnerRecord.createdAt || new Date(),
    };
  } catch (error) {
    throw new Error(`Failed to fetch partner profile: ${error.message}`);
  }
};

/**
 * Fetch all customers created by this partner (queries User and Card models with createdBy)
 */
exports.getCustomersByPartner = async (partnerUserId) => {
  try {
    const Card = require("../models/card.model");

    const objectId = mongoose.Types.ObjectId.isValid(partnerUserId)
      ? new mongoose.Types.ObjectId(partnerUserId)
      : null;

    if (!objectId) return { customers: [], total: 0 };

    // Query users created by this partner
    const users = await User.find({ createdBy: objectId }).select("-password");

    // Query cards created by this partner
    const cards = await Card.find({ createdBy: objectId });

    const customerMap = new Map();

    users.forEach((u) => {
      customerMap.set(u._id.toString(), {
        _id: u._id,
        customerId: `CUST-${u._id.toString().slice(-6).toUpperCase()}`,
        firstName: u.name?.split(" ")[0] || "Customer",
        lastName: u.name?.split(" ").slice(1).join(" ") || "",
        businessName: u.name || "Customer",
        email: u.email,
        phones: u.phoneNumber ? [{ number: u.phoneNumber }] : [],
        accountType: u.role || "customer",
        status: u.isActive ? "active" : "pending",
        createdAt: u.createdAt,
      });
    });

    cards.forEach((c) => {
      const cardName = c.cardDetails?.name || c.personalDetails?.name || "Client";
      const cardEmail = c.cardDetails?.email || (c.contactDetails?.emails && c.contactDetails.emails[0]?.address) || "";
      const cardPhones = c.contactDetails?.phones || [];
      const idKey = c.userId ? c.userId.toString() : c._id.toString();

      if (!customerMap.has(idKey)) {
        customerMap.set(idKey, {
          _id: c._id,
          customerId: `CARD-${c._id.toString().slice(-6).toUpperCase()}`,
          firstName: cardName.split(" ")[0] || "Client",
          lastName: cardName.split(" ").slice(1).join(" ") || "",
          businessName: c.cardDetails?.companyName || cardName,
          email: cardEmail,
          phones: cardPhones,
          accountType: c.cardType || "Standard",
          status: c.isActive !== false ? "active" : "pending",
          createdAt: c.createdAt,
        });
      }
    });

    const customers = Array.from(customerMap.values());
    return {
      customers,
      total: customers.length,
    };
  } catch (error) {
    console.error("Error fetching customers by partner:", error);
    return { customers: [], total: 0 };
  }
};
