const mongoose = require("mongoose");
const FranchisePartner = require("../models/franchise-partner.model");

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

    const newPartner = { ...partnerData, partnerId: partnerData.userId, status: "pending" };

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

    const partner = franchise.partners.id(partnerId);
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
        (p) => p.partnerId.toString() === userId
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

    const partner = franchise.partners.id(partnerId);
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

    const partner = franchise.partners.id(partnerId);
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
    const franchise = await FranchisePartner.findOne({
      userId,
      role: "franchise",
    });

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

    franchise.partners.pull(partnerId);
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
      pendingPartners: franchise.partners.filter((p) => p.status === "pending")
        .length,
      approvedPartners: franchise.partners.filter((p) => p.status === "approved")
        .length,
    };
  } catch (error) {
    throw new Error(`Failed to get statistics: ${error.message}`);
  }
};

exports.getPartnersByFranchise = async (franchiseId) => {
  try {
    const franchise = await FranchisePartner.findOne({ userId: franchiseId });
    if (!franchise) throw new Error("Franchise not found");

    return { partners: franchise.partners, total: franchise.partners.length };
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

// =====================================================================

// exports.getPartnerProfile = async (userId) => {
//   const partner = await FranchisePartner.findOne({ "partners.partnerId": userId });

//   if (!partner) {
//     throw new Error("Partner not found");
//   }

//   // Extract partner specific record from partners array
//   const partnerRecord = partner.partners.find(
//     (p) => p.partnerId.toString() === userId.toString()
//   );

//   return {
//     userId: partnerRecord.partnerId,
//     businessName: partnerRecord.businessName,
//     phone: partnerRecord.phone,
//     email: partnerRecord.email,
//     createdAt: partnerRecord.createdAt,
//   };
// };




exports.getPartnerProfile = async (userId) => {
  const partner = await FranchisePartner.findOne({
    "partners.partnerId": new mongoose.Types.ObjectId(userId),
  });

  if (!partner) {
    throw new Error("Partner not found");
  }

  // Extract partner specific record from partners array
  const partnerRecord = partner.partners.find(
    (p) => p.partnerId.toString() === userId.toString()
  );

  return {
    userId: partnerRecord.partnerId,
    businessName: partnerRecord.businessName,
    phone: partnerRecord.phone,
    email: partnerRecord.email,
    createdAt: partnerRecord.createdAt,
  };
};

/**
 * Fetch all customers created by this partner
 */
exports.getCustomersByPartner = async (partnerUserId) => {
  // TODO – replace this with actual Customer model when available
  // For now return empty list so the dashboard works
  return {
    customers: [],
    total: 0,
  };
};

// module.exports = {
//   getPartnerProfile,
//   getCustomersByPartner,
// };
