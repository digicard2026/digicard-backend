// const express = require('express');
// const router = express.Router();
// const franchisePartnerController = require('../controllers/franchisePartner-controller');
// const multer = require('multer');
// const upload = require('../middlewares/multer'); 

// // Apply multer to handle form-data for both create and save-step
// router.post('/create', upload.any(), franchisePartnerController.createFranchisePartner);
// router.post('/save-step', upload.any(), franchisePartnerController.saveRegistrationStep);

// // Other routes remain the same
// router.get('/:userId', franchisePartnerController.getFranchisePartner);
// router.get('/', franchisePartnerController.getAllFranchisePartners);
// router.get('/franchise/:franchiseId/partners', franchisePartnerController.getPartnersByFranchise);
// router.patch('/:userId/status', franchisePartnerController.updateStatus);
// router.patch('/:userId/kyc', franchisePartnerController.updateKYCStatus);
// router.patch('/:userId/payment', franchisePartnerController.updatePaymentStatus);
// router.delete('/:userId', franchisePartnerController.deleteFranchisePartner);

// module.exports = router;


// routes/franchisePartner.routes.js
// const express = require('express');
// const router = express.Router();
// const upload = require('../middlewares/multer'); 
// const franchisePartnerController = require('../controllers/franchisePartner-controller');

// // Create franchise
// router.put('/franchise/create', franchisePartnerController.createFranchise);

// // Partner management routes
// router.put('/franchise/:franchiseUserId/partners', franchisePartnerController.addPartner);
// router.get('/franchise/:userId', franchisePartnerController.getFranchiseByUserId);
// router.get('/franchise/:franchiseUserId/partners', franchisePartnerController.getFranchiseWithPartners);
// router.get('/franchise/:franchiseUserId/partners/:partnerId', franchisePartnerController.getPartner);
// router.patch('/franchise/:franchiseUserId/partners/:partnerId', franchisePartnerController.updatePartner);
// router.patch('/franchise/:franchiseUserId/partners/:partnerId/status', franchisePartnerController.updatePartnerStatus);
// router.delete('/franchise/:franchiseUserId/partners/:partnerId', franchisePartnerController.removePartner);
// router.get('/franchise/:franchiseUserId/statistics', franchisePartnerController.getFranchiseStatistics);
// router.get('/:franchiseId/partners', franchisePartnerController.getPartnersByFranchise);
// router.post('/save-step', upload.any(), franchisePartnerController.saveRegistrationStep);
// module.exports = router;



// routes/franchisePartner.routes.js
const express = require('express');
const router = express.Router();
const upload = require('../middlewares/multer'); 
const franchisePartnerController = require('../controllers/franchisePartner-controller');

// Create franchise
router.put('/franchise/create', franchisePartnerController.createFranchise);

// Partner management routes
router.put('/franchise/:franchiseUserId/partners', franchisePartnerController.addPartner);
router.get('/franchise/:userId', franchisePartnerController.getFranchiseByUserId);
router.get('/franchise/:franchiseUserId/partners', franchisePartnerController.getFranchiseWithPartners);
router.get('/franchise/:franchiseUserId/partners/:partnerId', franchisePartnerController.getPartner);
router.patch('/franchise/:franchiseUserId/partners/:partnerId', franchisePartnerController.updatePartner);
router.patch('/franchise/:franchiseUserId/partners/:partnerId/status', franchisePartnerController.updatePartnerStatus);
router.delete('/franchise/:franchiseUserId/partners/:partnerId', franchisePartnerController.removePartner);
router.get('/franchise/:franchiseUserId/statistics', franchisePartnerController.getFranchiseStatistics);
router.get('/:franchiseId/partners', franchisePartnerController.getPartnersByFranchise);

// Registration step saving with file upload
router.post('/save-step', upload.any(), franchisePartnerController.saveRegistrationStep);

// Direct franchise update route
router.patch('/franchise/:franchiseId', franchisePartnerController.updateFranchise);


router.get("/profile/:userId", franchisePartnerController.getPartnerProfile);

// Fetch customers list of partner
router.get("/:partnerUserId/customers", franchisePartnerController.getCustomersOfPartner);

module.exports = router;