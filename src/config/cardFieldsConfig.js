
const cardFieldsConfig = {
  Personal: {
    name: 'Personal',
    description: 'Basic digital card with essential features',
    allowed: [
      // From Personal column in image
      'profilePhoto',         // Profile /PC/Logo
      'firstName',            // Name / source name
      'lastName',             // Name / source name  
      'tagline',              // Tag line / Slogan
      'profileVideo',         // Profile video
      'aboutText',            // About my self
      
      // Contact management section
      'phones',               // One-tap call, WhatsApp, email
      'emails',               // One-tap call, WhatsApp, email
      'websites',             // website/portfolio link
      'addresses',            // Location [address]
      
      // Social & Digital Hub section
      'socialLinks',          // LinkedIn, Instagram, Facebook, X, YouTube, WhatsApp Business Link, Google Business Page
      
      // Utilities section
      'dynamicQRCode',        // Dynamic QR code
      'shareableUrl',         // Share
      'nfcSettings',          // NFC card developer with Print
      'downloads',            // Downloads
      'videos'                // Videos
    ]
  },

  Business: {
    name: 'Business',
    description: 'Enhanced features for professional presence',
    allowed: [
      // ALL Personal fields
      'profilePhoto',         // Profile /PC/Logo
      'firstName',            // Name / source name
      'lastName',             // Name / source name  
      'tagline',              // Tag line / Slogan
      'profileVideo',         // Profile video
      'aboutText',            // About my self/company/organisation
      'phones',               // One-tap call, WhatsApp, email
      'emails',               // One-tap call, WhatsApp, email
      'websites',             // website/portfolio link
      'addresses',            // Location [address]
      'socialLinks',          // Social & Digital Hub
      'dynamicQRCode',        // Dynamic QR code
      'shareableUrl',         // Share
      'nfcSettings',          // NFC card developer with Print
      'downloads',            // Downloads
      'videos',               // Videos
      
      // PLUS Business-only fields from image
      'companyName',          // Company name / Organisation
      'businessHours',        // Business hours
      'virtualNumber',        // Virtual no integration (Optional @m extra cost)
      
      // Professional/Business Details section
      'services',             // Service/Provision
      'servicesProducts',     // Brief about Product/Services (Only Product name display with general briefing)
      'gallery',              // Product show case / Gallery/Portfolio
      'catalog',              // Product/Catalog [PDF]
      'productVideo',         // Product video
      'testimonials'          // Testimonials
    ]
  },

  BusinessPremium: {
    name: 'BusinessPremium',
    description: 'Advanced features with interactive elements',
    allowed: [
      // ALL Business fields (which includes all Personal fields)
      'profilePhoto',         // Profile /PC/Logo
      'firstName',            // Name / source name
      'lastName',             // Name / source name  
      'tagline',              // Tag line / Slogan
      'profileVideo',         // Profile video
      'aboutText',            // About my self/company/organisation
      'phones',               // One-tap call, WhatsApp, email
      'emails',               // One-tap call, WhatsApp, email
      'websites',             // website/portfolio link
      'addresses',            // Location [address]
      'socialLinks',          // Social & Digital Hub
      'dynamicQRCode',        // Dynamic QR code
      'shareableUrl',         // Share
      'nfcSettings',          // NFC card developer with Print
      'downloads',            // Downloads
      'videos',               // Videos
      'companyName',          // Company name / Organisation
      'businessHours',        // Business hours
      'virtualNumber',        // Virtual no integration (Optional @m extra cost)
      'services',             // Service/Provision
      'servicesProducts',     // Brief about Product/Services (Individual Product display along with official)
      'gallery',              // Product show case / Gallery/Portfolio
      'catalog',              // Product/Catalog [PDF]
      'productVideo',         // Product video
      'testimonials',         // Testimonials
      
      // PLUS BusinessPremium-only fields from image
      'interactiveElements',       // Interactive Elements: Call-to-Action, Live Chat, Appointment scheduler, Digital Payments, Lead form, Chat assistant
      'individualProductDisplay',  // Individual Product display
      'clientList',                // Testimonials / Client list
      'businessCardInstagram',     // Business card/Instagram
      'textbooks'                  // Textbooks
    ]
  }
};

module.exports = cardFieldsConfig;