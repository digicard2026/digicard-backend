
const cardService = require("../services/card-service");
// CREATE card with S3 file uploads (POST)

const path = require("path");

// CREATE card with S3 file uploads (POST)
exports.createCard = async (req, res) => {
    try {
        let cardDetails = req.body;
        
        // Parse JSON if it's a string
        if (typeof cardDetails === "string") {
            try {
                cardDetails = JSON.parse(cardDetails);
            } catch (parseError) {
                return res.status(400).json({ 
                    success: false, 
                    error: "Invalid JSON format in request body" 
                });
            }
        }
        
        if (!cardDetails || typeof cardDetails !== 'object') {
            return res.status(400).json({ 
                success: false, 
                error: "Valid card details not found" 
            });
        }
       
        // Set default cardType if not provided
        if (!cardDetails.cardType) {
            cardDetails.cardType = 'Personal';
        }
        
        // Helper function to sanitize filename
        const sanitizeFilename = (filename) => {
            return path.parse(filename).name.replace(/[^a-zA-Z0-9]/g, ' ').trim();
        };
        
        // Handle S3 file uploads if present
        if (req.files) {
            console.log("Uploaded files:", req.files);
            
            // Handle profile photo
            if (req.files['profilePhoto'] && req.files['profilePhoto'][0]) {
                cardDetails.profilePhoto = req.files['profilePhoto'][0].location;
            }
            
            // Handle company logo
            if (req.files['companyLogo'] && req.files['companyLogo'][0]) {
                cardDetails.companyLogo = req.files['companyLogo'][0].location;
            }
            
            // Handle profile video FILE upload
            if (req.files['profileVideo'] && req.files['profileVideo'][0]) {
                const videoFile = req.files['profileVideo'][0];
                cardDetails.profileVideo = {
                    url: videoFile.location,
                    thumbnail: "",
                    title: sanitizeFilename(videoFile.originalname),
                    uploadType: 'upload'
                };
            }
            // If profileVideo is in body as URL, keep it structured
            else if (cardDetails.profileVideo && cardDetails.profileVideo.url) {
                // Ensure proper structure
                cardDetails.profileVideo = {
                    url: cardDetails.profileVideo.url,
                    thumbnail: cardDetails.profileVideo.thumbnail || "",
                    title: cardDetails.profileVideo.title || "",
                    uploadType: cardDetails.profileVideo.uploadType || 'url'
                };
            }
            
            // Handle product video FILE upload
            if (req.files['productVideo'] && req.files['productVideo'][0]) {
                const videoFile = req.files['productVideo'][0];
                cardDetails.productVideo = {
                    url: videoFile.location,
                    thumbnail: "",
                    title: sanitizeFilename(videoFile.originalname),
                    uploadType: 'upload'
                };
            }
            // If productVideo is in body as URL, keep it structured
            else if (cardDetails.productVideo && cardDetails.productVideo.url) {
                cardDetails.productVideo = {
                    url: cardDetails.productVideo.url,
                    thumbnail: cardDetails.productVideo.thumbnail || "",
                    title: cardDetails.productVideo.title || "",
                    uploadType: cardDetails.productVideo.uploadType || 'url'
                };
            }
            
            // Handle gallery images
            if (req.files['gallery'] && req.files['gallery'].length > 0) {
                const galleryItems = req.files['gallery'].map(file => ({
                    type: file.mimetype.startsWith('image/') ? "image" : 
                           file.mimetype.startsWith('video/') ? "video" : "file",
                    url: file.location,
                    title: sanitizeFilename(file.originalname),
                    mimetype: file.mimetype,
                    size: file.size,
                    filename: file.originalname,
                    category: "uploaded",
                    uploadType: 'upload',
                    uploadedAt: new Date()
                }));
                
                // Merge with existing gallery from body if any
                const existingGallery = cardDetails.gallery || [];
                cardDetails.gallery = [...existingGallery, ...galleryItems];
            }
            
            // Handle catalog PDF
            if (req.files['catalogPDF'] && req.files['catalogPDF'][0]) {
                const pdfFile = req.files['catalogPDF'][0];
                cardDetails.catalogPDF = {
                    url: pdfFile.location,
                    name: sanitizeFilename(pdfFile.originalname),
                    size: pdfFile.size,
                    uploadedAt: new Date()
                };
                // Also set catalog field for backward compatibility
                cardDetails.catalog = pdfFile.location;
            }
            
            // Handle downloads
            if (req.files['downloads'] && req.files['downloads'].length > 0) {
                const downloadItems = req.files['downloads'].map(file => ({
                    name: sanitizeFilename(file.originalname),
                    fileUrl: file.location,
                    fileType: file.mimetype,
                    fileSize: file.size,
                    originalName: file.originalname,
                    uploadedAt: new Date(),
                    uploadType: 'upload'
                }));
                
                const existingDownloads = cardDetails.downloads || [];
                cardDetails.downloads = [...existingDownloads, ...downloadItems];
            }
            
            // Handle videos (multiple)
            if (req.files['videos'] && req.files['videos'].length > 0) {
                const videoItems = req.files['videos'].map(file => ({
                    type: "video",
                    url: file.location,
                    title: sanitizeFilename(file.originalname),
                    mimetype: file.mimetype,
                    size: file.size,
                    filename: file.originalname,
                    uploadedAt: new Date(),
                    uploadType: 'upload'
                }));
                
                const existingVideos = cardDetails.videos || [];
                cardDetails.videos = [...existingVideos, ...videoItems];
            }
        }
        
        // Clean up: If video objects exist but have no URL, remove them
        if (cardDetails.profileVideo && (!cardDetails.profileVideo.url || cardDetails.profileVideo.url.trim() === "")) {
            delete cardDetails.profileVideo;
        }
        
        if (cardDetails.productVideo && (!cardDetails.productVideo.url || cardDetails.productVideo.url.trim() === "")) {
            delete cardDetails.productVideo;
        }
        
        // Remove empty arrays
        ['gallery', 'downloads', 'videos', 'services', 'products'].forEach(field => {
            if (cardDetails[field] && Array.isArray(cardDetails[field]) && cardDetails[field].length === 0) {
                delete cardDetails[field];
            }
        });
       
        // Call service to create card
        const card = await cardService.createCard(cardDetails);
        
        res.status(201).json({ 
            success: true, 
            message: "Card created successfully", 
            card,
            cardId: card._id
        });
    } catch (error) {
        console.error("Create Card error:", error);
        res.status(400).json({ 
            success: false, 
            error: error.message,
            ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
        });
    }
};

// UPDATE card with S3 file uploads (PUT)
exports.updateCard = async (req, res) => {
    try {
        const { cardId } = req.params;
        let cardDetails = req.body;
        
        if (!cardId) {
            return res.status(400).json({ 
                success: false, 
                error: "Card ID is required" 
            });
        }
        
        // Parse JSON if it's a string
        if (typeof cardDetails === "string") {
            try {
                cardDetails = JSON.parse(cardDetails);
            } catch (parseError) {
                return res.status(400).json({ 
                    success: false, 
                    error: "Invalid JSON format in request body" 
                });
            }
        }
        
        if (!cardDetails || typeof cardDetails !== 'object') {
            return res.status(400).json({ 
                success: false, 
                error: "Valid card details not found" 
            });
        }
        
        // Get existing card
        const existingCard = await cardService.getCardById(cardId);
        if (!existingCard) {
            return res.status(404).json({ 
                success: false, 
                error: "Card not found" 
            });
        }
        
        // Handle S3 file uploads if present
        if (req.files) {
            console.log("Uploaded files for update:", req.files);
            
            // Helper function to sanitize filename
            const sanitizeFilename = (filename) => {
                return path.parse(filename).name.replace(/[^a-zA-Z0-9]/g, ' ').trim();
            };
            
            // Handle profile photo - only update if new file is provided
            if (req.files['profilePhoto'] && req.files['profilePhoto'][0]) {
                cardDetails.profilePhoto = req.files['profilePhoto'][0].location;
            }
            
            // Handle company logo - only update if new file is provided
            if (req.files['companyLogo'] && req.files['companyLogo'][0]) {
                cardDetails.companyLogo = req.files['companyLogo'][0].location;
            }
            
            // Handle gallery images - Merge with existing
            if (req.files['gallery'] && req.files['gallery'].length > 0) {
                const newGalleryItems = req.files['gallery'].map(file => ({
                    type: file.mimetype.startsWith('image/') ? "image" : 
                           file.mimetype.startsWith('video/') ? "video" : "file",
                    url: file.location,
                    title: sanitizeFilename(file.originalname),
                    mimetype: file.mimetype,
                    size: file.size,
                    filename: file.originalname,
                    category: "uploaded",
                    uploadedAt: new Date()
                }));
                
                // Merge with existing gallery items
                cardDetails.gallery = [...(existingCard.gallery || []), ...newGalleryItems];
            }
            
            // Handle catalog PDF - only update if new file is provided
            if (req.files['catalogPDF'] && req.files['catalogPDF'][0]) {
                cardDetails.catalogPDF = {
                    url: req.files['catalogPDF'][0].location,
                    name: sanitizeFilename(req.files['catalogPDF'][0].originalname),
                    size: req.files['catalogPDF'][0].size,
                    uploadedAt: new Date()
                };
            }
            
            // Handle downloads - Merge with existing
            if (req.files['downloads'] && req.files['downloads'].length > 0) {
                const newDownloadItems = req.files['downloads'].map(file => ({
                    name: sanitizeFilename(file.originalname),
                    fileUrl: file.location,
                    fileType: file.mimetype,
                    fileSize: file.size,
                    originalName: file.originalname,
                    uploadedAt: new Date()
                }));
                
                cardDetails.downloads = [...(existingCard.downloads || []), ...newDownloadItems];
            }
            
            // Handle videos - Merge with existing
            if (req.files['videos'] && req.files['videos'].length > 0) {
                const newVideoItems = req.files['videos'].map(file => ({
                    type: "video",
                    url: file.location,
                    title: sanitizeFilename(file.originalname),
                    mimetype: file.mimetype,
                    size: file.size,
                    filename: file.originalname,
                    uploadedAt: new Date()
                }));
                
                cardDetails.videos = [...(existingCard.videos || []), ...newVideoItems];
            }
        }
        
        // Call service to update card
        const updatedCard = await cardService.updateCard(cardId, cardDetails);
       
        res.status(200).json({ 
            success: true, 
            message: "Card updated successfully", 
            card: updatedCard 
        });
    } catch (error) {
        console.error("Update Card error:", error);
        
        // Better error handling
        if (error.message.includes('Invalid card ID format')) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid card ID format' 
            });
        }
        
        if (error.name === 'CastError') {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid card ID' 
            });
        }
        
        res.status(400).json({ 
            success: false, 
            error: error.message 
        });
    }
};
// exports.createCard = async (req, res) => {
//     try {
//         const cardDetails = req.body;
//         if (!cardDetails) {
//             return res.status(400).json({ error: "Card details not found" });
//         }
       
//         // Set default cardType if not provided
//         if (!cardDetails.cardType) {
//             cardDetails.cardType = 'Personal';
//         }
 
//         // ✅ ADD THIS: Ensure createdBy is included from request body
//         // The createdBy field will automatically be included in cardDetails
//         // since it's part of req.body from your frontend
       
//         const card = await cardService.createCard(cardDetails);
//         res.status(201).json({ success: true, message: "Card created successfully", card });
//     } catch (error) {
//         res.status(400).json({ success: false, error: error.message });
//     }
// };
 
// exports.updateCard = async (req, res) => {
//     try {
//         const { cardId } = req.params;
//         const cardDetails = req.body;
       
//         if (!cardId || !cardDetails) {
//             return res.status(400).json({ error: "Card ID or card details not found" });
//         }
       
//         const card = await cardService.updateCard(cardId, cardDetails);
//         if (!card) {
//             return res.status(404).json({ error: "Card not found" });
//         }
       
//         res.status(200).json({ success: true, message: "Card updated successfully", card });
//     } catch (error) {
//         if (error.message.includes('Invalid card ID format')) {
//             return res.status(400).json({ success: false, message: 'Invalid card ID format' });
//         }
//         if (error.message.includes('This URL is already taken')) {
//             return res.status(409).json({ success: false, message: error.message });
//         }
//         if (error.message.includes('This custom URL is already taken')) {
//             return res.status(409).json({ success: false, message: error.message });
//         }
//         res.status(400).json({ success: false, error: error.message });
//     }
// };

// GET - Get all card types with features
exports.getAllCardTypes = async (req, res) => {
  try {
    const cardTypes = Object.keys(cardFieldsConfig).map(key => ({
      id: key,
      name: cardFieldsConfig[key].name,
      description: cardFieldsConfig[key].description,
      features: cardFieldsConfig[key].features
    }));
   
    res.status(200).json({
      success: true,
      data: cardTypes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};
 
// GET - Get available fields for specific card type
exports.getCardFieldsByType = async (req, res) => {
  try {
    const { cardType } = req.params;
    const config = cardFieldsConfig[cardType];
   
    if (!config) {
      return res.status(400).json({
        success: false,
        message: 'Invalid card type'
      });
    }
   
    res.status(200).json({
      success: true,
      cardType: config.name,
      description: config.description,
      features: config.features,
      requiredFields: config.required,
      optionalFields: config.allowed,
      allFields: [...new Set([...config.required, ...config.allowed])]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};
// READ - Get all cards
exports.getAllCards = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '' } = req.query;
        const skip = (page - 1) * limit;
 
        const { cards, total } = await cardService.getAllCards(parseInt(skip), parseInt(limit), search);
 
        res.status(200).json({
            success: true,
            message: "Cards fetched successfully",
            cards,
            total,
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / limit)
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};
 
// READ - Get card by ID
exports.getCardById = async (req, res) => {
    try {
        const { cardId } = req.params;
        if (!cardId) {
            return res.status(400).json({ success: false, message: 'Card ID not provided' });
        }
 
        const card = await cardService.getCardById(cardId);
        if (!card) {
            return res.status(404).json({ success: false, message: 'Card not found' });
        }
 
        res.status(200).json({ success: true, message: "Card fetched successfully", card });
    } catch (error) {
        if (error.message.includes('Invalid card ID format')) {
            return res.status(400).json({ success: false, message: 'Invalid card ID format' });
        }
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};
 
// READ - Get card by email
// exports.getCardByEmail = async (req, res) => {
//     try {
//         const { email } = req.params;
       
//         if (!email) {
//             return res.status(400).json({ success: false, message: 'Email parameter is required' });
//         }
 
//         const card = await cardService.getCardByEmail(email);
//         if (!card) {
//             return res.status(404).json({ success: false, message: 'Card not found' });
//         }
 
//         res.status(200).json({ success: true, message: "Card fetched successfully", card });
//     } catch (error) {
//         res.status(500).json({ success: false, message: 'Server Error', error: error.message });
//     }
// };
// READ - Get ALL cards by email
exports.getCardByEmail = async (req, res) => {
    try {
        const { email } = req.params;
       
        if (!email) {
            return res.status(400).json({ success: false, message: 'Email parameter is required' });
        }
 
        const cards = await cardService.getCardByEmail(email); // ✅ Now returns array
       
        if (!cards || cards.length === 0) {
            return res.status(404).json({ success: false, message: 'No cards found for this email' });
        }
 
        res.status(200).json({
            success: true,
            message: "Cards fetched successfully",
            cards: cards, // ✅ Returns array of cards
            count: cards.length
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};
// READ - Get public card by shareable link
exports.getPublicCard = async (req, res) => {
    try {
        const { shareableLink } = req.params;
        if (!shareableLink) {
            return res.status(400).json({ success: false, message: 'Shareable link not provided' });
        }
 
        const card = await cardService.getPublicCard(shareableLink);
        if (!card) {
            return res.status(404).json({ success: false, message: 'Card not found' });
        }
 
        await cardService.incrementViewCount(card._id);
        res.status(200).json({ success: true, message: "Card fetched successfully", card });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};
 
// READ - Get card by URL slug
exports.getCardByUrlSlug = async (req, res) => {
    try {
        const { urlSlug } = req.params;
       
        if (!urlSlug) {
            return res.status(400).json({ success: false, message: 'URL slug not provided' });
        }
 
        const card = await cardService.getCardByUrlSlug(urlSlug);
        if (!card) {
            return res.status(404).json({ success: false, message: 'Card not found' });
        }
 
        // Check if card is public
        if (!card.isPublic) {
            return res.status(403).json({ success: false, message: 'This card is not publicly accessible' });
        }
 
        await cardService.incrementViewCount(card._id);
        res.status(200).json({ success: true, message: "Card fetched successfully", card });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};
 
// CHECK - Check URL availability
exports.checkUrlAvailability = async (req, res) => {
    try {
        const { url } = req.query;
       
        if (!url) {
            return res.status(400).json({ success: false, message: 'URL parameter is required' });
        }
 
        // Check if URL is already taken
        const existingCard = await cardService.getCardByUrlSlug(url);
       
        res.status(200).json({
            success: true,
            available: !existingCard,
            message: existingCard ? 'URL is already taken' : 'URL is available'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};
 
// CHECK - Check email availability
exports.checkEmailAvailability = async (req, res) => {
    try {
        const { email } = req.query;
       
        if (!email) {
            return res.status(400).json({ success: false, message: 'Email parameter is required' });
        }
 
        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ success: false, message: 'Invalid email format' });
        }
 
        // Check if email is already registered
        const existingCard = await cardService.getCardByEmail(email);
       
        res.status(200).json({
            success: true,
            exists: !!existingCard,
            message: existingCard ? 'Email is already registered' : 'Email is available'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};
 
// UPDATE - Update card by ID
// exports.updateCard = async (req, res) => {
//     try {
//         const { cardId } = req.params;
//         const cardDetails = req.body;
       
//         if (!cardId || !cardDetails) {
//             return res.status(400).json({ error: "Card ID or card details not found" });
//         }
       
//         const card = await cardService.updateCard(cardId, cardDetails);
//         if (!card) {
//             return res.status(404).json({ error: "Card not found" });
//         }
       
//         res.status(200).json({ success: true, message: "Card updated successfully", card });
//     } catch (error) {
//         if (error.message.includes('Invalid card ID format')) {
//             return res.status(400).json({ success: false, message: 'Invalid card ID format' });
//         }
//         if (error.message.includes('This URL is already taken')) {
//             return res.status(409).json({ success: false, message: error.message });
//         }
//         if (error.message.includes('This custom URL is already taken')) {
//             return res.status(409).json({ success: false, message: error.message });
//         }
//         res.status(400).json({ success: false, error: error.message });
//     }
// };
// UPDATE YOUR EXISTING updateCard FUNCTION:

 
// UPDATE - Update card by email
exports.updateCardByEmail = async (req, res) => {
    try {
        const { email } = req.params;
        const cardDetails = req.body;
       
        if (!email || !cardDetails) {
            return res.status(400).json({ error: "Email or card details not found" });
        }
       
        const card = await cardService.updateCardByEmail(email, cardDetails);
        if (!card) {
            return res.status(404).json({ error: "Card not found" });
        }
       
        res.status(200).json({ success: true, message: "Card updated successfully", card });
    } catch (error) {
        if (error.message.includes('Card not found')) {
            return res.status(404).json({ success: false, message: error.message });
        }
        if (error.message.includes('This URL is already taken')) {
            return res.status(409).json({ success: false, message: error.message });
        }
        if (error.message.includes('This custom URL is already taken')) {
            return res.status(409).json({ success: false, message: error.message });
        }
        res.status(400).json({ success: false, error: error.message });
    }
};
 
// UPDATE - Auto-save card by ID
exports.autoSaveCard = async (req, res) => {
    try {
        const { cardId } = req.params;
        const cardData = req.body;
       
        if (!cardId || !cardData) {
            return res.status(400).json({ error: "Card ID or card data not found" });
        }
       
        const card = await cardService.autoSaveCard(cardId, cardData);
        if (!card) {
            return res.status(404).json({ error: "Card not found" });
        }
       
        res.status(200).json({ success: true, message: "Card auto-saved successfully", card });
    } catch (error) {
        if (error.message.includes('Invalid card ID format')) {
            return res.status(400).json({ success: false, message: 'Invalid card ID format' });
        }
        res.status(400).json({ success: false, error: error.message });
    }
};
 
// UPDATE - Auto-save card by email
exports.autoSaveCardByEmail = async (req, res) => {
    try {
        const { email } = req.params;
        const cardData = req.body;
       
        if (!email || !cardData) {
            return res.status(400).json({ error: "Email or card data not found" });
        }
       
        const card = await cardService.autoSaveCardByEmail(email, cardData);
        if (!card) {
            return res.status(404).json({ error: "Card not found" });
        }
       
        res.status(200).json({ success: true, message: "Card auto-saved successfully", card });
    } catch (error) {
        if (error.message.includes('Card not found')) {
            return res.status(404).json({ success: false, message: error.message });
        }
        res.status(400).json({ success: false, error: error.message });
    }
};
 
// UPDATE - Publish card by ID
exports.publishCard = async (req, res) => {
    try {
        const { cardId } = req.params;
       
        if (!cardId) {
            return res.status(400).json({ error: "Card ID not found" });
        }
       
        const card = await cardService.publishCard(cardId);
        if (!card) {
            return res.status(404).json({ error: "Card not found" });
        }
       
        res.status(200).json({ success: true, message: "Card published successfully", card });
    } catch (error) {
        if (error.message.includes('Invalid card ID format')) {
            return res.status(400).json({ success: false, message: 'Invalid card ID format' });
        }
        res.status(400).json({ success: false, error: error.message });
    }
};
 
// UPDATE - Publish card by email
exports.publishCardByEmail = async (req, res) => {
    try {
        const { email } = req.params;
       
        if (!email) {
            return res.status(400).json({ error: "Email not found" });
        }
       
        const card = await cardService.publishCardByEmail(email);
        if (!card) {
            return res.status(404).json({ error: "Card not found" });
        }
       
        res.status(200).json({ success: true, message: "Card published successfully", card });
    } catch (error) {
        if (error.message.includes('Card not found')) {
            return res.status(404).json({ success: false, message: error.message });
        }
        res.status(400).json({ success: false, error: error.message });
    }
};
 
// UPDATE - Unpublish card by ID
exports.unpublishCard = async (req, res) => {
    try {
        const { cardId } = req.params;
       
        if (!cardId) {
            return res.status(400).json({ error: "Card ID not found" });
        }
       
        const card = await cardService.unpublishCard(cardId);
        if (!card) {
            return res.status(404).json({ error: "Card not found" });
        }
       
        res.status(200).json({ success: true, message: "Card unpublished successfully", card });
    } catch (error) {
        if (error.message.includes('Invalid card ID format')) {
            return res.status(400).json({ success: false, message: 'Invalid card ID format' });
        }
        res.status(400).json({ success: false, error: error.message });
    }
};
 
// UPDATE - Unpublish card by email
exports.unpublishCardByEmail = async (req, res) => {
    try {
        const { email } = req.params;
       
        if (!email) {
            return res.status(400).json({ error: "Email not found" });
        }
       
        const card = await cardService.unpublishCardByEmail(email);
        if (!card) {
            return res.status(404).json({ error: "Card not found" });
        }
       
        res.status(200).json({ success: true, message: "Card unpublished successfully", card });
    } catch (error) {
        if (error.message.includes('Card not found')) {
            return res.status(404).json({ success: false, message: error.message });
        }
        res.status(400).json({ success: false, error: error.message });
    }
};
 
// DELETE - Delete card by ID
exports.deleteCard = async (req, res) => {
    try {
        const { cardId } = req.params;
       
        if (!cardId) {
            return res.status(400).json({ error: "Card ID not found" });
        }
       
        const result = await cardService.deleteCard(cardId);
        if (!result) {
            return res.status(404).json({ error: "Card not found" });
        }
       
        res.status(200).json({ success: true, message: "Card deleted successfully" });
    } catch (error) {
        if (error.message.includes('Invalid card ID format')) {
            return res.status(400).json({ success: false, message: 'Invalid card ID format' });
        }
        res.status(400).json({ success: false, error: error.message });
    }
};
 
// DELETE - Delete card by email
exports.deleteCardByEmail = async (req, res) => {
    try {
        const { email } = req.params;
       
        if (!email) {
            return res.status(400).json({ error: "Email not found" });
        }
       
        const result = await cardService.deleteCardByEmail(email);
        if (!result) {
            return res.status(404).json({ error: "Card not found" });
        }
       
        res.status(200).json({ success: true, message: "Card deleted successfully" });
    } catch (error) {
        if (error.message.includes('Card not found')) {
            return res.status(404).json({ success: false, message: error.message });
        }
        res.status(400).json({ success: false, error: error.message });
    }
};
 
// SEARCH - Search cards
exports.searchCards = async (req, res) => {
    try {
        const { query } = req.params;
       
        if (!query) {
            return res.status(400).json({ error: "Search query not found" });
        }
       
        const cards = await cardService.searchCards(query);
        if (!cards || cards.length === 0) {
            return res.status(404).json({ success: false, message: "No cards found" });
        }
       
        res.status(200).json({ success: true, message: "Cards found successfully", cards });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};
 
// ANALYTICS - Get card analytics by ID
exports.getCardAnalytics = async (req, res) => {
    try {
        const { cardId } = req.params;
       
        if (!cardId) {
            return res.status(400).json({ error: "Card ID not found" });
        }
       
        const analytics = await cardService.getCardAnalytics(cardId);
        res.status(200).json({ success: true, message: "Analytics fetched successfully", analytics });
    } catch (error) {
        if (error.message.includes('Invalid card ID format')) {
            return res.status(400).json({ success: false, message: 'Invalid card ID format' });
        }
        res.status(400).json({ success: false, error: error.message });
    }
};
 
// ANALYTICS - Get card analytics by email
exports.getCardAnalyticsByEmail = async (req, res) => {
    try {
        const { email } = req.params;
       
        if (!email) {
            return res.status(400).json({ error: "Email not found" });
        }
       
        const analytics = await cardService.getCardAnalyticsByEmail(email);
        res.status(200).json({ success: true, message: "Analytics fetched successfully", analytics });
    } catch (error) {
        if (error.message.includes('Card not found')) {
            return res.status(404).json({ success: false, message: error.message });
        }
        res.status(400).json({ success: false, error: error.message });
    }
};
 
 
exports.getCustomerByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
 
    const customers = await cardService.getCustomerByUserId(userId);
 
    return res.status(200).json({
      success: true,
      count: customers.length,
      data: customers
    });
 
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch customers",
      error: error.message
    });
  }
};