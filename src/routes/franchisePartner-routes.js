const express = require('express');
const router = express.Router();
const upload = require('../middlewares/multer'); 
const franchisePartnerController = require('../controllers/franchisePartner-controller');
const { auth } = require('../middlewares/auth-middleware');

// Create franchise
router.put('/franchise/create', auth, franchisePartnerController.createFranchise);

// Partner management routes (Protected by auth)
router.put('/franchise/:franchiseUserId/partners', auth, franchisePartnerController.addPartner);
router.get('/franchise/:userId', auth, franchisePartnerController.getFranchiseByUserId);
router.get('/franchise/:franchiseUserId/partners', auth, franchisePartnerController.getFranchiseWithPartners);
router.get('/franchise/:franchiseUserId/partners/:partnerId', auth, franchisePartnerController.getPartner);
router.patch('/franchise/:franchiseUserId/partners/:partnerId', auth, franchisePartnerController.updatePartner);
router.patch('/franchise/:franchiseUserId/partners/:partnerId/status', auth, franchisePartnerController.updatePartnerStatus);
router.delete('/franchise/:franchiseUserId/partners/:partnerId', auth, franchisePartnerController.removePartner);
router.get('/franchise/:franchiseUserId/statistics', auth, franchisePartnerController.getFranchiseStatistics);
router.get('/:franchiseId/partners', auth, franchisePartnerController.getPartnersByFranchise);

// Registration step saving with file upload
router.post('/save-step', upload.any(), franchisePartnerController.saveRegistrationStep);

// Direct franchise update route
router.patch('/franchise/:franchiseId', auth, franchisePartnerController.updateFranchise);

// Partner profile and customer attribution routes
router.get("/profile/:userId", auth, franchisePartnerController.getPartnerProfile);
router.get("/:partnerUserId/customers", auth, franchisePartnerController.getCustomersOfPartner);

module.exports = router;