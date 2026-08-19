// const cardModel = require("../models/card.model");
// const { v4: uuidv4 } = require('uuid');
// const mongoose = require('mongoose');
// const slugify = require('slugify');
// const FRONTEND_URL = process.env.FRONTEND_URL || "";
// // Helper function to check if ID is valid
// const isValidObjectId = (id) => {
//     return mongoose.Types.ObjectId.isValid(id);
// };

// // Helper function to generate URL slug using slugify
// const generateUrlSlug = (text) => {
//     if (!text) return `profile-${Date.now()}`;
    
//     return slugify(text, {
//         lower: true,
//         strict: true,
//         remove: /[*+~.()'"!:@]/g,
//         replacement: '-'
//     });
// };

// // CREATE - Create new card with URL handling
// // CREATE - Create new card with URL handling
// exports.createCard = async (cardData) => {
//     try {
//         // First, check if email already has cards
//         // const existingCardsWithEmail = await cardModel.find({ email: cardData.email });
//         // if (existingCardsWithEmail && existingCardsWithEmail.length > 0) {
//         //     throw new Error(`Email "${cardData.email}" already has ${existingCardsWithEmail.length} card(s). Please login to edit existing cards.`);
//         // }
        
//         // Generate URL slug and shareable URL
//         let urlSlug;
//         let shareableUrl;
        
//         if (cardData.customUrl && cardData.customUrl.trim()) {
//             urlSlug = generateUrlSlug(cardData.customUrl);
            
//             // Check if custom URL is already taken
//             const existingCard = await cardModel.findOne({ urlSlug });
//             if (existingCard) {
//                 throw new Error(`This custom URL "${cardData.customUrl}" is already taken`);
//             }
//         } else {
//             // Auto-generate from email
//             const emailSlug = cardData.email.split('@')[0];
//             let baseSlug = generateUrlSlug(emailSlug);
            
//             // Ensure uniqueness
//             let uniqueSlug = baseSlug;
//             let counter = 1;
//             let maxAttempts = 100;
            
//             while (await cardModel.findOne({ urlSlug: uniqueSlug })) {
//                 if (counter >= maxAttempts) {
//                     const randomStr = Math.random().toString(36).substring(2, 8);
//                     uniqueSlug = `${baseSlug}-${randomStr}`;
//                     break;
//                 }
//                 uniqueSlug = `${baseSlug}-${counter}`;
//                 counter++;
//             }
//             urlSlug = uniqueSlug;
//         }
        
//         // Generate shareable URL
//         // const baseUrl = process.env.BASE_URL || 'http://localhost:5173';
//         shareableUrl = `${FRONTEND_URL}/preview/${urlSlug}`;
        
//         // Generate legacy shareableLink for backward compatibility
//         const shareableLink = uuidv4();
        
//         const newCard = new cardModel({ 
//             ...cardData, 
//             urlSlug,
//             shareableUrl,
//             shareableLink,
//             lastSaved: new Date()
//         });
        
//         return await newCard.save();
//     } catch (error) {
//         console.error('Error in createCard service:', error);
//         throw error;
//     }
// };

// // READ - Get card by URL slug
// exports.getCardByUrlSlug = async (urlSlug) => {
//     return await cardModel.findOne({ urlSlug }).lean();
// };

// // READ - Get card by email
// exports.getCardByEmail = async (email) => {
//     return await cardModel.find({ email }).lean();
// };

// // UPDATE - Update card with URL handling (by ID)
// exports.updateCard = async (cardId, updatedCard) => {
//     if (!isValidObjectId(cardId)) {
//         throw new Error('Invalid card ID format');
//     }

//     let urlUpdateNeeded = false;
//     let newUrlSlug;

//     // Handle URL updates if customUrl is being changed
//     if (updatedCard.customUrl && updatedCard.customUrl.trim()) {
//         newUrlSlug = generateUrlSlug(updatedCard.customUrl);
//         urlUpdateNeeded = true;
//     }
//     // Handle URL updates if email is being changed (NEW LOGIC)
//     else if (updatedCard.email && updatedCard.email.trim()) {
//         // Get the current card to check if email is actually changing
//         const currentCard = await cardModel.findById(cardId);
//         if (currentCard && currentCard.email !== updatedCard.email) {
//             // Email is changing, generate new URL slug from new email
//             const emailSlug = updatedCard.email.split('@')[0];
//             newUrlSlug = generateUrlSlug(emailSlug);
//             urlUpdateNeeded = true;
            
//             // Ensure uniqueness for the new email-based URL
//             let uniqueSlug = newUrlSlug;
//             let counter = 1;
//             while (await cardModel.findOne({ 
//                 urlSlug: uniqueSlug, 
//                 _id: { $ne: cardId } 
//             })) {
//                 uniqueSlug = `${newUrlSlug}-${counter}`;
//                 counter++;
//             }
//             newUrlSlug = uniqueSlug;
//         }
//     }

//     // If URL needs to be updated, check availability and update fields
//     if (urlUpdateNeeded && newUrlSlug) {
//         // Check if the new URL is taken by another card
//         const existingCard = await cardModel.findOne({ 
//             urlSlug: newUrlSlug, 
//             _id: { $ne: cardId } 
//         });
        
//         if (existingCard) {
//             throw new Error('This URL is already taken by another card');
//         }
        
//         // Update URL fields
//         const baseUrl = process.env.BASE_URL || 'http://localhost:5173';
//         updatedCard.urlSlug = newUrlSlug;
//         updatedCard.shareableUrl = `${baseUrl}/preview/${newUrlSlug}`;
//     }

//     return await cardModel.findByIdAndUpdate(
//         cardId, 
//         { 
//             ...updatedCard, 
//             lastSaved: new Date()
//         }, 
//         { new: true, runValidators: true }
//     );
// };

// // UPDATE - Update card by email
// exports.updateCardByEmail = async (email, updatedCard) => {
//     // First find the card by email to get the ID
//     const existingCard = await cardModel.findOne({ email });
//     if (!existingCard) {
//         throw new Error('Card not found with this email');
//     }
    
//     // Then update using the ID
//     return await exports.updateCard(existingCard._id, updatedCard);
// };

// // READ - Get all cards with pagination
// exports.getAllCards = async (skip = 0, limit = 10, search = '') => {
//     let filter = {};
    
//     if (search) {
//         filter.$or = [
//             { firstName: { $regex: search, $options: 'i' } },
//             { lastName: { $regex: search, $options: 'i' } },
//             { companyName: { $regex: search, $options: 'i' } },
//             { jobTitle: { $regex: search, $options: 'i' } },
//             { urlSlug: { $regex: search, $options: 'i' } },
//             { email: { $regex: search, $options: 'i' } }
//         ];
//     }

//     const cards = await cardModel.find(filter)
//         .skip(skip)
//         .limit(limit)
//         .sort({ createdAt: -1 })
//         .lean();

//     const total = await cardModel.countDocuments(filter);

//     return { cards, total };
// };

// // READ - Get card by ID
// exports.getCardById = async (cardId) => {
//     if (!isValidObjectId(cardId)) {
//         throw new Error('Invalid card ID format');
//     }
//     return await cardModel.findById(cardId).lean();
// };

// // READ - Get public card by shareable link
// exports.getPublicCard = async (shareableLink) => {
//     return await cardModel.findOne({ 
//         shareableLink
//     }).lean();
// };

// // UPDATE - Auto-save card by ID
// exports.autoSaveCard = async (cardId, cardData) => {
//     if (!isValidObjectId(cardId)) {
//         throw new Error('Invalid card ID format');
//     }
//     return await cardModel.findByIdAndUpdate(
//         cardId,
//         { 
//             autoSaveData: cardData,
//             lastSaved: new Date()
//         },
//         { new: true }
//     );
// };

// // UPDATE - Auto-save card by email
// exports.autoSaveCardByEmail = async (email, cardData) => {
//     const existingCard = await cardModel.findOne({ email });
//     if (!existingCard) {
//         throw new Error('Card not found with this email');
//     }
    
//     return await exports.autoSaveCard(existingCard._id, cardData);
// };

// // UPDATE - Publish card by ID
// exports.publishCard = async (cardId) => {
//     if (!isValidObjectId(cardId)) {
//         throw new Error('Invalid card ID format');
//     }
//     return await cardModel.findByIdAndUpdate(
//         cardId,
//         { 
//             isPublished: true,
//             lastSaved: new Date()
//         },
//         { new: true }
//     );
// };

// // UPDATE - Publish card by email
// exports.publishCardByEmail = async (email) => {
//     const existingCard = await cardModel.findOne({ email });
//     if (!existingCard) {
//         throw new Error('Card not found with this email');
//     }
    
//     return await exports.publishCard(existingCard._id);
// };

// // UPDATE - Unpublish card by ID
// exports.unpublishCard = async (cardId) => {
//     if (!isValidObjectId(cardId)) {
//         throw new Error('Invalid card ID format');
//     }
//     return await cardModel.findByIdAndUpdate(
//         cardId,
//         { 
//             isPublished: false,
//             lastSaved: new Date()
//         },
//         { new: true }
//     );
// };

// // UPDATE - Unpublish card by email
// exports.unpublishCardByEmail = async (email) => {
//     const existingCard = await cardModel.findOne({ email });
//     if (!existingCard) {
//         throw new Error('Card not found with this email');
//     }
    
//     return await exports.unpublishCard(existingCard._id);
// };

// // DELETE - Delete card by ID
// exports.deleteCard = async (cardId) => {
//     if (!isValidObjectId(cardId)) {
//         throw new Error('Invalid card ID format');
//     }
//     return await cardModel.findByIdAndDelete(cardId);
// };

// // DELETE - Delete card by email
// exports.deleteCardByEmail = async (email) => {
//     const existingCard = await cardModel.findOne({ email });
//     if (!existingCard) {
//         throw new Error('Card not found with this email');
//     }
    
//     return await exports.deleteCard(existingCard._id);
// };

// // SEARCH - Search cards
// exports.searchCards = async (query) => {
//     return await cardModel.find({
//         $or: [
//             { firstName: { $regex: query, $options: 'i' } },
//             { lastName: { $regex: query, $options: 'i' } },
//             { companyName: { $regex: query, $options: 'i' } },
//             { jobTitle: { $regex: query, $options: 'i' } },
//             { email: { $regex: query, $options: 'i' } },
//             { urlSlug: { $regex: query, $options: 'i' } },
//             { customUrl: { $regex: query, $options: 'i' } },
//             { 'emails.address': { $regex: query, $options: 'i' } }
//         ]
//     }).lean();
// };

// // ANALYTICS - Increment view count
// exports.incrementViewCount = async (cardId) => {
//     if (!isValidObjectId(cardId)) {
//         throw new Error('Invalid card ID format');
//     }
//     return await cardModel.findByIdAndUpdate(
//         cardId,
//         { $inc: { views: 1 } },
//         { new: true }
//     );
// };

// // ANALYTICS - Get card analytics by ID
// exports.getCardAnalytics = async (cardId) => {
//     if (!isValidObjectId(cardId)) {
//         throw new Error('Invalid card ID format');
//     }
//     const card = await cardModel.findById(cardId).lean();
    
//     if (!card) {
//         throw new Error('Card not found');
//     }

//     return {
//         views: card.views || 0,
//         createdAt: card.createdAt,
//         lastSaved: card.lastSaved,
//         isPublished: card.isPublished,
//         lastAccessed: new Date()
//     };
// };

// // ANALYTICS - Get card analytics by email
// exports.getCardAnalyticsByEmail = async (email) => {
//     const existingCard = await cardModel.findOne({ email });
//     if (!existingCard) {
//         throw new Error('Card not found with this email');
//     }
    
//     return await exports.getCardAnalytics(existingCard._id);
// };


// exports.getCustomerByUserId = async (userId) => {
//   return await cardModel.find({ createdBy: userId });
// };
const cardModel = require("../models/card.model");
const { v4: uuidv4 } = require('uuid');
const mongoose = require('mongoose');
const slugify = require('slugify');
 
// Helper function to check if ID is valid
const isValidObjectId = (id) => {
    return mongoose.Types.ObjectId.isValid(id);
};
 
// Helper function to generate URL slug using slugify
const generateUrlSlug = (text) => {
    if (!text) return `profile-${Date.now()}`;
   
    return slugify(text, {
        lower: true,
        strict: true,
        remove: /[*+~.()'"!:@]/g,
        replacement: '-'
    });
};
 
// CREATE - Create new card with URL handling
// CREATE - Create new card with URL handling
exports.createCard = async (cardData) => {
    try {

        // First, check if email already has cards
        // const existingCardsWithEmail = await cardModel.find({ email: cardData.email });
        // if (existingCardsWithEmail && existingCardsWithEmail.length > 0) {
        //     throw new Error(`Email "${cardData.email}" already has ${existingCardsWithEmail.length} card(s). Please login to edit existing cards.`);
        // }
        
      
       
        // Generate URL slug and shareable URL
        let urlSlug;
        let shareableUrl;
       
        if (cardData.customUrl && cardData.customUrl.trim()) {
            urlSlug = generateUrlSlug(cardData.customUrl);
           
            // Check if custom URL is already taken
            const existingCard = await cardModel.findOne({ urlSlug });
            if (existingCard) {
                throw new Error(`This custom URL "${cardData.customUrl}" is already taken`);
            }
        } else {
            // Auto-generate from email
            const emailSlug = cardData.email.split('@')[0];
            let baseSlug = generateUrlSlug(emailSlug);
           
            // Ensure uniqueness
            let uniqueSlug = baseSlug;
            let counter = 1;
            let maxAttempts = 100;
           
            while (await cardModel.findOne({ urlSlug: uniqueSlug })) {
                if (counter >= maxAttempts) {
                    const randomStr = Math.random().toString(36).substring(2, 8);
                    uniqueSlug = `${baseSlug}-${randomStr}`;
                    break;
                }
                uniqueSlug = `${baseSlug}-${counter}`;
                counter++;
            }
            urlSlug = uniqueSlug;
        }
       
        // Generate shareable URL
        // const baseUrl = process.env.BASE_URL || 'http://localhost:5173';
        const baseUrl = process.env.FRONTEND_URL ;
        shareableUrl = `${baseUrl}/preview/${urlSlug}`;
       
        // Generate legacy shareableLink for backward compatibility
        const shareableLink = uuidv4();
       
        const newCard = new cardModel({
            ...cardData,
            urlSlug,
            shareableUrl,
            shareableLink,
            lastSaved: new Date()
        });
       
        return await newCard.save();
    } catch (error) {
        console.error('Error in createCard service:', error);
        throw error;
    }
};
 
// READ - Get card by URL slug
exports.getCardByUrlSlug = async (urlSlug) => {
    return await cardModel.findOne({ urlSlug }).lean();
};
 
// READ - Get card by email
exports.getCardByEmail = async (email) => {
    return await cardModel.find({ email }).lean();
};
 
// UPDATE - Update card with URL handling (by ID)
// exports.updateCard = async (cardId, updatedCard) => {
//     if (!isValidObjectId(cardId)) {
//         throw new Error('Invalid card ID format');
//     }
 
//     let urlUpdateNeeded = false;
//     let newUrlSlug;
 
//     // Handle URL updates if customUrl is being changed
//     if (updatedCard.customUrl && updatedCard.customUrl.trim()) {
//         newUrlSlug = generateUrlSlug(updatedCard.customUrl);
//         urlUpdateNeeded = true;
//     }
//     // Handle URL updates if email is being changed (NEW LOGIC)
//     else if (updatedCard.email && updatedCard.email.trim()) {
//         // Get the current card to check if email is actually changing
//         const currentCard = await cardModel.findById(cardId);
//         if (currentCard && currentCard.email !== updatedCard.email) {
//             // Email is changing, generate new URL slug from new email
//             const emailSlug = updatedCard.email.split('@')[0];
//             newUrlSlug = generateUrlSlug(emailSlug);
//             urlUpdateNeeded = true;
           
//             // Ensure uniqueness for the new email-based URL
//             let uniqueSlug = newUrlSlug;
//             let counter = 1;
//             while (await cardModel.findOne({
//                 urlSlug: uniqueSlug,
//                 _id: { $ne: cardId }
//             })) {
//                 uniqueSlug = `${newUrlSlug}-${counter}`;
//                 counter++;
//             }
//             newUrlSlug = uniqueSlug;
//         }
//     }
 
//     // If URL needs to be updated, check availability and update fields
//     if (urlUpdateNeeded && newUrlSlug) {
//         // Check if the new URL is taken by another card
//         const existingCard = await cardModel.findOne({
//             urlSlug: newUrlSlug,
//             _id: { $ne: cardId }
//         });
       
//         if (existingCard) {
//             throw new Error('This URL is already taken by another card');
//         }
       
//         // Update URL fields
//         const baseUrl = process.env.BASE_URL || 'http://localhost:5173';
//         updatedCard.urlSlug = newUrlSlug;
//         updatedCard.shareableUrl = `${baseUrl}/preview/${newUrlSlug}`;
//     }
 
//     return await cardModel.findByIdAndUpdate(
//         cardId,
//         {
//             ...updatedCard,
//             lastSaved: new Date()
//         },
//         { new: true, runValidators: true }
//     );
// };
 // UPDATE - Update card with URL handling (by ID) - FIXED VERSION
exports.updateCard = async (cardId, updatedCard) => {
    if (!isValidObjectId(cardId)) {
        throw new Error('Invalid card ID format');
    }

    // Get the current card first
    const currentCard = await cardModel.findById(cardId);
    if (!currentCard) {
        throw new Error('Card not found');
    }

    // IMPORTANT: When editing, we should NOT change the URL slug
    // Keep the existing URL slug regardless of email changes
    // Only update URL if explicitly changing customUrl
    let urlUpdateNeeded = false;
    let newUrlSlug;

    // Handle URL updates ONLY if customUrl is explicitly provided and different
    if (updatedCard.customUrl !== undefined && updatedCard.customUrl.trim() !== '') {
        // Only update if it's actually different from current
        if (currentCard.customUrl !== updatedCard.customUrl) {
            newUrlSlug = generateUrlSlug(updatedCard.customUrl);
            urlUpdateNeeded = true;
        }
    }
    // Do NOT generate new URL slug from email when editing
    // This was causing the issue

    // If URL needs to be updated, check availability and update fields
    if (urlUpdateNeeded && newUrlSlug) {
        // Check if the new URL is taken by another card
        const existingCard = await cardModel.findOne({
            urlSlug: newUrlSlug,
            _id: { $ne: cardId }
        });
       
        if (existingCard) {
            throw new Error('This URL is already taken by another card');
        }
       
        // Update URL fields
        // const baseUrl = process.env.BASE_URL || 'http://localhost:5173';
        const baseUrl = process.env.FRONTEND_URL ;
        updatedCard.urlSlug = newUrlSlug;
        updatedCard.shareableUrl = `${baseUrl}/preview/${newUrlSlug}`;
    } else {
        // Preserve existing URL fields when not changing
        updatedCard.urlSlug = currentCard.urlSlug;
        updatedCard.shareableUrl = currentCard.shareableUrl;
        
        // Also preserve customUrl if not provided
        if (updatedCard.customUrl === undefined) {
            updatedCard.customUrl = currentCard.customUrl;
        }
    }

    // Merge with existing data to ensure we don't lose fields
    const mergedData = {
        ...currentCard.toObject(),
        ...updatedCard,
        // Ensure these fields are preserved
        _id: currentCard._id,
        createdAt: currentCard.createdAt,
        // Update timestamp
        lastSaved: new Date()
    };

    // Remove any undefined fields
    Object.keys(mergedData).forEach(key => {
        if (mergedData[key] === undefined) {
            delete mergedData[key];
        }
    });

    const result = await cardModel.findByIdAndUpdate(
        cardId,
        mergedData,
        { new: true, runValidators: true }
    );

    if (!result) {
        throw new Error('Failed to update card');
    }

    return result;
};
// UPDATE - Update card by email
// exports.updateCardByEmail = async (email, updatedCard) => {
//     // First find the card by email to get the ID
//     const existingCard = await cardModel.findOne({ email });
//     if (!existingCard) {
//         throw new Error('Card not found with this email');
//     }
   
//     // Then update using the ID
//     return await exports.updateCard(existingCard._id, updatedCard);
// };
 // UPDATE - Update card by email - FIXED VERSION
exports.updateCardByEmail = async (email, updatedCard) => {
    // First find the card by email to get the ID
    const existingCard = await cardModel.findOne({ email });
    if (!existingCard) {
        throw new Error('Card not found with this email');
    }
   
    // Then update using the ID (which will preserve URL)
    return await exports.updateCard(existingCard._id, updatedCard);
};
// READ - Get all cards with pagination
exports.getAllCards = async (skip = 0, limit = 10, search = '') => {
    let filter = {};
   
    if (search) {
        filter.$or = [
            { firstName: { $regex: search, $options: 'i' } },
            { lastName: { $regex: search, $options: 'i' } },
            { companyName: { $regex: search, $options: 'i' } },
            { jobTitle: { $regex: search, $options: 'i' } },
            { urlSlug: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } }
        ];
    }
 
    const cards = await cardModel.find(filter)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .lean();
 
    const total = await cardModel.countDocuments(filter);
 
    return { cards, total };
};
 
// READ - Get card by ID
exports.getCardById = async (cardId) => {
    if (!isValidObjectId(cardId)) {
        throw new Error('Invalid card ID format');
    }
    return await cardModel.findById(cardId).lean();
};
 
// READ - Get public card by shareable link
exports.getPublicCard = async (shareableLink) => {
    return await cardModel.findOne({
        shareableLink
    }).lean();
};
 
// UPDATE - Auto-save card by ID
exports.autoSaveCard = async (cardId, cardData) => {
    if (!isValidObjectId(cardId)) {
        throw new Error('Invalid card ID format');
    }
    return await cardModel.findByIdAndUpdate(
        cardId,
        {
            autoSaveData: cardData,
            lastSaved: new Date()
        },
        { new: true }
    );
};
 
// UPDATE - Auto-save card by email
exports.autoSaveCardByEmail = async (email, cardData) => {
    const existingCard = await cardModel.findOne({ email });
    if (!existingCard) {
        throw new Error('Card not found with this email');
    }
   
    return await exports.autoSaveCard(existingCard._id, cardData);
};
 
// UPDATE - Publish card by ID
exports.publishCard = async (cardId) => {
    if (!isValidObjectId(cardId)) {
        throw new Error('Invalid card ID format');
    }
    return await cardModel.findByIdAndUpdate(
        cardId,
        {
            isPublished: true,
            lastSaved: new Date()
        },
        { new: true }
    );
};
 
// UPDATE - Publish card by email
exports.publishCardByEmail = async (email) => {
    const existingCard = await cardModel.findOne({ email });
    if (!existingCard) {
        throw new Error('Card not found with this email');
    }
   
    return await exports.publishCard(existingCard._id);
};
 
// UPDATE - Unpublish card by ID
exports.unpublishCard = async (cardId) => {
    if (!isValidObjectId(cardId)) {
        throw new Error('Invalid card ID format');
    }
    return await cardModel.findByIdAndUpdate(
        cardId,
        {
            isPublished: false,
            lastSaved: new Date()
        },
        { new: true }
    );
};
 
// UPDATE - Unpublish card by email
exports.unpublishCardByEmail = async (email) => {
    const existingCard = await cardModel.findOne({ email });
    if (!existingCard) {
        throw new Error('Card not found with this email');
    }
   
    return await exports.unpublishCard(existingCard._id);
};
 
// DELETE - Delete card by ID
exports.deleteCard = async (cardId) => {
    if (!isValidObjectId(cardId)) {
        throw new Error('Invalid card ID format');
    }
    return await cardModel.findByIdAndDelete(cardId);
};
 
// DELETE - Delete card by email
exports.deleteCardByEmail = async (email) => {
    const existingCard = await cardModel.findOne({ email });
    if (!existingCard) {
        throw new Error('Card not found with this email');
    }
   
    return await exports.deleteCard(existingCard._id);
};
 
// SEARCH - Search cards
exports.searchCards = async (query) => {
    return await cardModel.find({
        $or: [
            { firstName: { $regex: query, $options: 'i' } },
            { lastName: { $regex: query, $options: 'i' } },
            { companyName: { $regex: query, $options: 'i' } },
            { jobTitle: { $regex: query, $options: 'i' } },
            { email: { $regex: query, $options: 'i' } },
            { urlSlug: { $regex: query, $options: 'i' } },
            { customUrl: { $regex: query, $options: 'i' } },
            { 'emails.address': { $regex: query, $options: 'i' } }
        ]
    }).lean();
};
 
// ANALYTICS - Increment view count
exports.incrementViewCount = async (cardId) => {
    if (!isValidObjectId(cardId)) {
        throw new Error('Invalid card ID format');
    }
    return await cardModel.findByIdAndUpdate(
        cardId,
        { $inc: { views: 1 } },
        { new: true }
    );
};
 
// ANALYTICS - Get card analytics by ID
exports.getCardAnalytics = async (cardId) => {
    if (!isValidObjectId(cardId)) {
        throw new Error('Invalid card ID format');
    }
    const card = await cardModel.findById(cardId).lean();
   
    if (!card) {
        throw new Error('Card not found');
    }
 
    return {
        views: card.views || 0,
        createdAt: card.createdAt,
        lastSaved: card.lastSaved,
        isPublished: card.isPublished,
        lastAccessed: new Date()
    };
};
 
// ANALYTICS - Get card analytics by email
exports.getCardAnalyticsByEmail = async (email) => {
    const existingCard = await cardModel.findOne({ email });
    if (!existingCard) {
        throw new Error('Card not found with this email');
    }
   
    return await exports.getCardAnalytics(existingCard._id);
};
 
 
exports.getCustomerByUserId = async (userId) => {
  return await cardModel.find({ createdBy: userId });
};
 
 