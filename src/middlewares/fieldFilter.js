// middleware/fieldFilter.js
const cardFieldsConfig = require('../config/cardFieldsConfig');

const filterFieldsByCardType = (req, res, next) => {
  if (req.method === 'POST' || req.method === 'PUT') {
    const cardType = req.body.cardType || 'Personal';
    const config = cardFieldsConfig[cardType];
    
    if (!config) {
      return res.status(400).json({
        success: false,
        message: 'Invalid card type'
      });
    }
    
    // Check if required fields are present
    for (const field of config.required) {
      if (!req.body[field]) {
        return res.status(400).json({
          success: false,
          message: `Missing required field: ${field}`
        });
      }
    }
    
    // Filter request body to only include allowed fields
    const allowedFields = [...config.required, ...config.allowed];
    const filteredBody = { cardType };
    
    Object.keys(req.body).forEach(key => {
      if (allowedFields.includes(key)) {
        filteredBody[key] = req.body[key];
      }
    });
    
    req.body = filteredBody;
  }
  next();
};

module.exports = filterFieldsByCardType;