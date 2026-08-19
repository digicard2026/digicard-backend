// const franchisePartnerService = require('../services/franchisePartner-service');

// class FranchisePartnerController {
  
//   // Create franchise
//   async createFranchise(req, res) {
//     try {
//       console.log('Create franchise request body:', req.body);
//       const result = await franchisePartnerService.createFranchisePartner(req.body);
      
//       res.status(201).json({
//         success: true,
//         message: 'Franchise created successfully',
//         data: result
//       });
//     } catch (error) {
//       console.error('Create franchise error:', error);
//       res.status(400).json({
//         success: false,
//         message: error.message
//       });
//     }
//   }

//   // Add partner to franchise
//   async addPartner(req, res) {
//     try {
//       const { franchiseUserId } = req.params;
//       console.log('Add partner request:', { franchiseUserId, body: req.body });
      
//       const result = await franchisePartnerService.addPartnerToFranchise(franchiseUserId, req.body);
      
//       res.status(201).json({
//         success: true,
//         message: 'Partner added successfully',
//         data: result
//       });
//     } catch (error) {
//       console.error('Add partner error:', error);
//       res.status(400).json({
//         success: false,
//         message: error.message
//       });
//     }
//   }

//   // Get franchise with partners
//   async getFranchiseWithPartners(req, res) {
//     try {
//       const { franchiseUserId } = req.params;
//       console.log('Get franchise with partners:', franchiseUserId);
      
//       const result = await franchisePartnerService.getFranchiseWithPartners(franchiseUserId);
      
//       res.json({
//         success: true,
//         data: result
//       });
//     } catch (error) {
//       console.error('Get franchise with partners error:', error);
//       res.status(404).json({
//         success: false,
//         message: error.message
//       });
//     }
//   }

//   // Get franchise by userId
//   async getFranchiseByUserId(req, res) {
//     try {
//       const { userId } = req.params;
//       console.log('Get franchise by userId:', userId);

//       const result = await franchisePartnerService.getFranchiseByUserId(userId);

//       res.status(200).json({
//         success: true,
//         message: 'Franchise fetched successfully',
//         data: result,
//       });
//     } catch (error) {
//       console.error('Get franchise by userId error:', error);
//       res.status(404).json({
//         success: false,
//         message: error.message,
//       });
//     }
//   }

//   // Get partner from franchise
//   async getPartner(req, res) {
//     try {
//       const { franchiseUserId, partnerId } = req.params;
//       console.log('Get partner:', { franchiseUserId, partnerId });
      
//       const result = await franchisePartnerService.getPartnerFromFranchise(franchiseUserId, partnerId);
      
//       res.json({
//         success: true,
//         data: result
//       });
//     } catch (error) {
//       console.error('Get partner error:', error);
//       res.status(404).json({
//         success: false,
//         message: error.message
//       });
//     }
//   }

//   // Update partner
//   async updatePartner(req, res) {
//     try {
//       const { franchiseUserId, partnerId } = req.params;
//       console.log('Update partner:', { franchiseUserId, partnerId, body: req.body });
      
//       const result = await franchisePartnerService.updatePartnerInFranchise(franchiseUserId, partnerId, req.body);
      
//       res.json({
//         success: true,
//         message: 'Partner updated successfully',
//         data: result
//       });
//     } catch (error) {
//       console.error('Update partner error:', error);
//       res.status(400).json({
//         success: false,
//         message: error.message
//       });
//     }
//   }

//   // Update partner status
//   async updatePartnerStatus(req, res) {
//     try {
//       const { franchiseUserId, partnerId } = req.params;
//       const { status } = req.body;
//       console.log('Update partner status:', { franchiseUserId, partnerId, status });

//       const result = await franchisePartnerService.updatePartnerStatus(franchiseUserId, partnerId, status);

//       res.json({
//         success: true,
//         message: 'Partner status updated successfully',
//         data: result
//       });
//     } catch (error) {
//       console.error('Update partner status error:', error);
//       res.status(400).json({
//         success: false,
//         message: error.message
//       });
//     }
//   }

//   // Remove partner from franchise
//   async removePartner(req, res) {
//     try {
//       const { franchiseUserId, partnerId } = req.params;
//       console.log('Remove partner:', { franchiseUserId, partnerId });

//       const result = await franchisePartnerService.removePartnerFromFranchise(franchiseUserId, partnerId);

//       res.json({
//         success: true,
//         message: 'Partner removed successfully',
//         data: result
//       });
//     } catch (error) {
//       console.error('Remove partner error:', error);
//       res.status(400).json({
//         success: false,
//         message: error.message
//       });
//     }
//   }

//   // Get franchise statistics
//   async getFranchiseStatistics(req, res) {
//     try {
//       const { franchiseUserId } = req.params;
//       console.log('Get franchise statistics:', franchiseUserId);

//       const result = await franchisePartnerService.getFranchiseStatistics(franchiseUserId);

//       res.json({
//         success: true,
//         data: result
//       });
//     } catch (error) {
//       console.error('Get franchise statistics error:', error);
//       res.status(400).json({
//         success: false,
//         message: error.message
//       });
//     }
//   }

//   async getPartnersByFranchise(req, res) {
//     try {
//       const { franchiseId } = req.params;
//       console.log('Get partners by franchise:', franchiseId);
      
//       const result = await franchisePartnerService.getPartnersByFranchise(franchiseId);
      
//       res.json({
//         success: true,
//         message: 'Partners fetched successfully',
//         data: result
//       });
      
//     } catch (error) {
//       console.error('Get partners by franchise error:', error);
//       res.status(400).json({
//         success: false,
//         message: error.message
//       });
//     }
//   }

//   async saveRegistrationStep(req, res) {
//     try {
//       console.log('Save registration step request body:', req.body);
//       console.log('Save registration step request files:', req.files);
      
//       // Combine body and files data
//       const saveData = { ...req.body };
      
//       // Handle file fields - SAVE ONLY FILENAMES
//       if (req.files) {
//         console.log('Processing uploaded files:', req.files);
        
//         // If req.files is an array (from upload.array() or upload.any())
//         if (Array.isArray(req.files)) {
//           req.files.forEach(file => {
//             console.log(`File uploaded - Field: ${file.fieldname}, Filename: ${file.filename}`);
//             saveData[file.fieldname] = file.filename; // Save only the filename
//           });
//         } 
//         // If req.files is an object (from upload.fields())
//         else {
//           Object.keys(req.files).forEach(fieldname => {
//             // Take the first file if multiple files for same field
//             const file = req.files[fieldname][0];
//             console.log(`File uploaded - Field: ${fieldname}, Filename: ${file.filename}`);
//             saveData[fieldname] = file.filename; // Save only the filename
//           });
//         }
//       }

//       console.log('Processed save data for registration step:', saveData);

//       const result = await franchisePartnerService.saveRegistrationStep(saveData);
      
//       res.json({
//         success: true,
//         message: 'Step saved successfully',
//         data: result
//       });
//     } catch (error) {
//       console.error('Save registration step error:', error);
//       res.status(400).json({
//         success: false,
//         message: error.message
//       });
//     }
//   }

//   // Direct update franchise endpoint
//   async updateFranchise(req, res) {
//     try {
//       const { franchiseId } = req.params;
//       console.log('Update franchise:', { franchiseId, body: req.body });
      
//       const result = await franchisePartnerService.updateFranchise(franchiseId, req.body);
      
//       res.json({
//         success: true,
//         message: 'Franchise updated successfully',
//         data: result
//       });
//     } catch (error) {
//       console.error('Update franchise error:', error);
//       res.status(400).json({
//         success: false,
//         message: error.message
//       });
//     }
//   }

// }

// module.exports = new FranchisePartnerController();





const service = require("../services/franchisePartner-service");


exports.createFranchise = async (req, res) => {
  try {
    const result = await service.createFranchisePartner(req.body);
    res.status(201).json({ success: true, message: "Franchise created", data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.addPartner = async (req, res) => {
  try {
    const result = await service.addPartnerToFranchise(req.params.franchiseUserId, req.body);
    res.status(201).json({ success: true, message: "Partner added", data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getFranchiseWithPartners = async (req, res) => {
  try {
    const result = await service.getFranchiseWithPartners(req.params.franchiseUserId);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
};

exports.getFranchiseByUserId = async (req, res) => {
  try {
    const result = await service.getFranchiseByUserId(req.params.userId);
    res.json({ success: true, message: "Franchise fetched", data: result });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
};

exports.getPartner = async (req, res) => {
  try {
    const result = await service.getPartnerFromFranchise(
      req.params.franchiseUserId,
      req.params.partnerId
    );
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
};

exports.updatePartner = async (req, res) => {
  try {
    const result = await service.updatePartnerInFranchise(
      req.params.franchiseUserId,
      req.params.partnerId,
      req.body
    );
    res.json({ success: true, message: "Partner updated", data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updatePartnerStatus = async (req, res) => {
  try {
    const result = await service.updatePartnerStatus(
      req.params.franchiseUserId,
      req.params.partnerId,
      req.body.status
    );
    res.json({ success: true, message: "Status updated", data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.removePartner = async (req, res) => {
  try {
    const result = await service.removePartnerFromFranchise(
      req.params.franchiseUserId,
      req.params.partnerId
    );
    res.json({ success: true, message: "Partner removed", data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getFranchiseStatistics = async (req, res) => {
  try {
    const result = await service.getFranchiseStatistics(req.params.franchiseUserId);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getPartnersByFranchise = async (req, res) => {
  try {
    const result = await service.getPartnersByFranchise(req.params.franchiseId);
    res.json({ success: true, message: "Partners fetched", data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.saveRegistrationStep = async (req, res) => {
  try {
    const saveData = { ...req.body };

    if (req.files) {
      if (Array.isArray(req.files)) {
        req.files.forEach((file) => {
          saveData[file.fieldname] = file.filename;
        });
      } else {
        Object.keys(req.files).forEach((field) => {
          saveData[field] = req.files[field][0].filename;
        });
      }
    }

    const result = await service.saveRegistrationStep(saveData);
    res.json({ success: true, message: "Step saved", data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateFranchise = async (req, res) => {
  try {
    const result = await service.updateFranchise(req.params.franchiseId, req.body);
    res.json({ success: true, message: "Franchise updated", data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};


// ================================================
exports.getPartnerProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    const partner = await service.getPartnerProfile(userId);

    res.status(200).json({
      success: true,
      data: partner,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getCustomersOfPartner = async (req, res) => {
  try {
    const { partnerUserId } = req.params;

    const customerData = await service.getCustomersByPartner(partnerUserId);

    res.status(200).json({
      success: true,
      data: customerData,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};