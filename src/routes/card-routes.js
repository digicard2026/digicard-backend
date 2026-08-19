
const express = require('express');
const router = express.Router();
const cardController = require('../controllers/card-controller');

const checksubscription = require("../middlewares/checkSubscription")

const upload = require('../utils/multer-util'); // S3 upload middleware

// Configure file upload fields for S3
const cardUpload = upload.fields([
    { name: 'profilePhoto', maxCount: 1 },
    { name: 'companyLogo', maxCount: 1 },
    { name: 'profileVideo', maxCount: 1 }, // ADD THIS
    { name: 'productVideo', maxCount: 1 }, // ADD THIS
    { name: 'gallery', maxCount: 50 },
    { name: 'catalogPDF', maxCount: 1 },
    { name: 'downloads', maxCount: 20 },
    { name: 'videos', maxCount: 10 }
]);

// CREATE card with S3 file upload (POST)
router.post('/create-card', cardUpload, cardController.createCard);

// UPDATE card with S3 file upload (PUT)
router.put('/update-card/:cardId', cardUpload, cardController.updateCard);

router.get('/types/all', cardController.getAllCardTypes);
router.get('/types/fields/:cardType', cardController.getCardFieldsByType);
// URL & Email Availability Checks
router.get('/check-url', cardController.checkUrlAvailability);
router.get('/check-email', cardController.checkEmailAvailability);

// Public Sharing Routes
router.get('/share/:urlSlug', cardController.getCardByUrlSlug);
router.get('/public/:shareableLink', cardController.getPublicCard);

// Get card by email
router.get('/email/:email', cardController.getCardByEmail);

// CREATE routes
// router.post('/create-card', cardController.createCard);

// READ routes
router.get('/get-all-cards', cardController.getAllCards);
router.get('/search/:query', cardController.searchCards);
router.get('/analytics/:cardId', cardController.getCardAnalytics);
router.get('/analytics-by-email/:email', cardController.getCardAnalyticsByEmail);

// UPDATE routes - Card ID based
// router.put('/update-card/:cardId', cardController.updateCard);
router.put('/auto-save-card/:cardId', cardController.autoSaveCard);
router.put('/publish-card/:cardId', cardController.publishCard);
router.put('/unpublish-card/:cardId', cardController.unpublishCard);

// UPDATE routes - Email based
router.put('/update-by-email/:email', cardController.updateCardByEmail);
router.put('/auto-save-by-email/:email', cardController.autoSaveCardByEmail);
router.put('/publish-by-email/:email', cardController.publishCardByEmail);
router.put('/unpublish-by-email/:email', cardController.unpublishCardByEmail);

// DELETE routes
router.delete('/delete-card/:cardId', cardController.deleteCard);
router.delete('/delete-by-email/:email', cardController.deleteCardByEmail);

// Keep this LAST - Get card by ID
router.get('/:cardId', cardController.getCardById);
router.get("/customers/by-user/:userId", cardController.getCustomerByUserId);


module.exports = router;