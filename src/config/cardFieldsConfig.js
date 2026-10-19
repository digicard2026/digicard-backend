const cardFieldsConfig = {
  Personal: {
    name: 'Personal',
    description: 'Basic digital card with essential individual features',
    required: ['firstName', 'email'],
    features: [
      // A. DIGITAL IDENTITY
      'Profile photo',
      'Name',
      'Designation/ Title',
      'Tag line',
      'Short intro',
      'Location',

      // B. CONTACT INFO
      'Mobile 1, Mobile 2',
      'WhatsApp',
      'Email',
      'Website',
      'Address',
      'Location map',

      // C. SOCIAL LINKS
      'LinkedIn',
      'Facebook',
      'Instagram',
      'X/ Twitter',
      'Others',
      'QR code',
      'Share'
    ],
    allowed: [
      // A. DIGITAL IDENTITY
      'profilePhoto',         // Profile photo
      'firstName',            // Name
      'lastName',             // Name
      'prefix',               // Name prefix
      'suffix',               // Name suffix
      'jobTitle',             // Designation/ Title
      'tagline',              // Tag line
      'aboutText',            // Short intro
      'bio',                  // Short intro

      // B. CONTACT INFO
      'phones',               // Mobile 1, mobile 2
      'email',                // Email
      'emails',               // Email
      'websites',             // Website
      'addresses',            // Address & Location map
      'enableOneTapCall',     // Call
      'enableWhatsApp',       // WhatsApp
      'enableEmail',          // Email

      // C. SOCIAL LINKS
      'socialLinks',          // LinkedIn, Facebook, Instagram, X/Twitter, Others
      'dynamicQRCode',        // QR code
      'shareableUrl',         // Share
      'shareableLink'         // Share
    ]
  },

  Business: {
    name: 'Business',
    description: 'Enhanced features for professional presence',
    required: ['firstName', 'email', 'companyName'],
    features: [
      // Personal features
      'Profile photo',
      'Name',
      'Designation/ Title',
      'Tag line',
      'Short intro',
      'Location',
      'Mobile 1, Mobile 2',
      'WhatsApp, Email, Website',
      'Address & Location map',
      'Social Links (LinkedIn, Facebook, Instagram, X, Others)',
      'Dynamic QR Code & Share',

      // Business features
      'Company Name / Organisation',
      'Company Logo',
      'Business Hours',
      'Virtual Number Integration',
      'Profile Video',
      'Services / Provision',
      'Brief about Product / Services',
      'Product Showcase / Gallery / Portfolio',
      'Product / Catalog [PDF]',
      'Product Video',
      'Testimonials',
      'NFC Settings',
      'Downloads',
      'Videos'
    ],
    allowed: [
      // ALL Personal fields
      'profilePhoto',
      'firstName',
      'lastName',
      'prefix',
      'suffix',
      'jobTitle',
      'tagline',
      'aboutText',
      'bio',
      'phones',
      'email',
      'emails',
      'websites',
      'addresses',
      'enableOneTapCall',
      'enableWhatsApp',
      'enableEmail',
      'socialLinks',
      'dynamicQRCode',
      'shareableUrl',
      'shareableLink',

      // Business fields
      'companyName',
      'companyLogo',
      'logoSize',
      'department',
      'organization',
      'businessHours',
      'virtualNumber',
      'profileVideo',
      'services',
      'servicesProducts',
      'gallery',
      'catalog',
      'catalogPDF',
      'productVideo',
      'testimonials',
      'nfcSettings',
      'downloads',
      'videos'
    ]
  },

  BusinessPremium: {
    name: 'BusinessPremium',
    description: 'Service Providers & Individuals - Advanced interactive features',
    required: ['firstName', 'email'],
    features: [
      'Name',
      'Profile Photo',
      'Service / Profession',
      'About The Services',
      'Service Area',
      'Location & Map',
      'Contacts (Mobile, WhatsApp, Email)',
      'Services / Provision',
      'Availability (Working days, Working Hours, Service availability)',
      'Customer Inquire (Service Require, Preferred date, Preferred time, Contact no)',
      'Dynamic QR Code & Share',
      'Interactive Elements (CTA, Digital Payments)',
      'NFC Card Support',
      'Downloads & Documents'
    ],
    allowed: [
      'profilePhoto',
      'firstName',
      'lastName',
      'prefix',
      'suffix',
      'jobTitle',
      'tagline',
      'aboutText',
      'bio',
      'phones',
      'email',
      'emails',
      'websites',
      'addresses',
      'enableOneTapCall',
      'enableWhatsApp',
      'enableEmail',
      'socialLinks',
      'dynamicQRCode',
      'shareableUrl',
      'shareableLink',
      'companyName',
      'companyLogo',
      'logoSize',
      'department',
      'organization',
      'businessHours',
      'virtualNumber',
      'profileVideo',
      'services',
      'servicesProducts',
      'gallery',
      'catalog',
      'catalogPDF',
      'productVideo',
      'testimonials',
      'nfcSettings',
      'downloads',
      'videos',
      'interactiveElements',
      'individualProductDisplay',
      'clientList',
      'businessCardInstagram',
      'textbooks',
      'chatAssistant',
      'liveChat',
      'foundedName',
      'brandLabel',
      'productRangeDisplay'
    ]
  },

  Professionals: {
    name: 'Professionals',
    description: 'DI - Professionals with full corporate and portfolio suite',
    required: ['firstName', 'email', 'companyName'],
    features: [
      'Personal Details (Profile Photo, Name, Tag line, About me)',
      'Personal Contacts (Mobile 1/2, WhatsApp, Email, Web/Portfolio, Social)',
      'Company Details (Company Name, Designation, Address, Contacts)',
      'Professional Summary (About, Expertise, Services, Certifications, Memberships)',
      'Portfolio Link & Testimonials',
      'Documents & Docs Upload',
      'Upload Video & Product Video',
      'Dynamic QR Code & Share',
      'Call to Action (CTA)'
    ],
    addons: [
      'Photo Gallery',
      'Catalog Builder',
      'Brochure Builder',
      'Profile Builder',
      'Portfolio Builder',
      'Docs Builder',
      'NFC Card',
      'Lead Generation',
      'Lead Management',
      'Appointment Booking',
      'WhatsApp Integration',
      'Analytics',
      'Docs Manager'
    ],
    allowed: [
      'profilePhoto',
      'firstName',
      'lastName',
      'prefix',
      'suffix',
      'jobTitle',
      'tagline',
      'aboutText',
      'bio',
      'phones',
      'email',
      'emails',
      'websites',
      'addresses',
      'enableOneTapCall',
      'enableWhatsApp',
      'enableEmail',
      'socialLinks',
      'dynamicQRCode',
      'shareableUrl',
      'shareableLink',
      'companyName',
      'companyLogo',
      'logoSize',
      'department',
      'organization',
      'businessHours',
      'virtualNumber',
      'profileVideo',
      'services',
      'servicesProducts',
      'gallery',
      'catalog',
      'catalogPDF',
      'productVideo',
      'testimonials',
      'nfcSettings',
      'downloads',
      'videos',
      'interactiveElements',
      'individualProductDisplay',
      'clientList',
      'businessCardInstagram',
      'textbooks',
      'chatAssistant',
      'liveChat',
      'foundedName',
      'brandLabel',
      'productRangeDisplay'
    ]
  },

  Entrepreneurials: {
    name: 'Entrepreneurials',
    description: 'DI - Entrepreneurials - Business & Role Showcase',
    required: ['firstName', 'email', 'companyName'],
    features: [
      'Personal Details (Profile Photo, Name, Tag line, Contact)',
      'Business Details (Company Name, Designation, Role, Products/Services)',
      'Location, Address, Contact No, Email ID, Website',
      'Mobile 1/2, WhatsApp, Email, Web/Portfolio, Social Media',
      'Dynamic QR Code, Share & CTA'
    ],
    addons: [
      'Photo Gallery',
      'Docs Builder',
      'Profile/Portfolio Builder',
      'NFC Card'
    ],
    allowed: [
      'profilePhoto', 'firstName', 'lastName', 'prefix', 'suffix',
      'jobTitle', 'tagline', 'aboutText', 'bio', 'phones',
      'email', 'emails', 'websites', 'addresses', 'enableOneTapCall',
      'enableWhatsApp', 'enableEmail', 'socialLinks', 'dynamicQRCode',
      'shareableUrl', 'shareableLink', 'companyName', 'companyLogo',
      'logoSize', 'department', 'organization', 'businessHours',
      'virtualNumber', 'profileVideo', 'services', 'servicesProducts',
      'gallery', 'catalog', 'catalogPDF', 'productVideo',
      'testimonials', 'nfcSettings', 'downloads', 'videos'
    ]
  },

  EntrepreneurialsMulti: {
    name: 'EntrepreneurialsMulti',
    description: 'DI - Entrepreneurials Multi-Activities - Ventures & Projects',
    required: ['firstName', 'email'],
    features: [
      'Personal Details (Profile Photo, Name, Founder/Entrepreneur, Short Intro)',
      'My Ventures +',
      'My Expertise +',
      'My Projects +',
      'My Services +',
      'My Products +',
      'WhatsApp Me & Book Me Direct Action',
      'Dynamic QR Code & Share'
    ],
    allowed: [
      'profilePhoto', 'firstName', 'lastName', 'prefix', 'suffix',
      'jobTitle', 'tagline', 'aboutText', 'bio', 'phones',
      'email', 'emails', 'websites', 'addresses', 'enableOneTapCall',
      'enableWhatsApp', 'enableEmail', 'socialLinks', 'dynamicQRCode',
      'shareableUrl', 'shareableLink', 'companyName', 'companyLogo',
      'services', 'servicesProducts', 'gallery', 'productVideo',
      'testimonials', 'downloads', 'videos', 'interactiveElements'
    ]
  },

  CorporateBusiness: {
    name: 'CorporateBusiness',
    description: 'DI - Business - Corporate Entity & Multi-location Management',
    required: ['firstName', 'email', 'companyName'],
    features: [
      'Company Identity (Logo, Brand Name, Business Name, Tag line, Intro)',
      'About Business (Overview, Products, Services, Docs Upload)',
      'Contact Structure (Multiple locations, Multiple persons, Roles & designation)',
      'Social Media Hub & Direct Inquiries',
      'Dynamic QR Code & Share'
    ],
    addons: [
      'Photo Gallery',
      'Docs Builder',
      'NFC Card'
    ],
    allowed: [
      'profilePhoto', 'firstName', 'lastName', 'prefix', 'suffix',
      'jobTitle', 'tagline', 'aboutText', 'bio', 'phones',
      'email', 'emails', 'websites', 'addresses', 'enableOneTapCall',
      'enableWhatsApp', 'enableEmail', 'socialLinks', 'dynamicQRCode',
      'shareableUrl', 'shareableLink', 'companyName', 'companyLogo',
      'logoSize', 'department', 'organization', 'businessHours',
      'virtualNumber', 'profileVideo', 'services', 'servicesProducts',
      'gallery', 'catalog', 'catalogPDF', 'productVideo',
      'testimonials', 'clientList', 'nfcSettings', 'downloads', 'videos',
      'interactiveElements'
    ]
  },

  MiniWebsite: {
    name: 'MiniWebsite',
    description: 'DP - Mini Website - Complete Digital Web & Landing Presence',
    required: ['firstName', 'email', 'companyName'],
    features: [
      'Company Logo, Brand Name, Business Name, Tag line, Overview',
      'Products & Services Showcase',
      'Photo Gallery & Embedded Video Showcase',
      'Brochures & Document Downloads',
      'Client Testimonials & Ratings',
      'Google Maps Location & Business Hours',
      'Lead Generation & Contact Form',
      'Custom Domain/URL & Basic Analytics'
    ],
    allowed: [
      'profilePhoto', 'firstName', 'lastName', 'prefix', 'suffix',
      'jobTitle', 'tagline', 'aboutText', 'bio', 'phones',
      'email', 'emails', 'websites', 'addresses', 'enableOneTapCall',
      'enableWhatsApp', 'enableEmail', 'socialLinks', 'dynamicQRCode',
      'shareableUrl', 'shareableLink', 'companyName', 'companyLogo',
      'logoSize', 'department', 'organization', 'businessHours',
      'virtualNumber', 'profileVideo', 'services', 'servicesProducts',
      'gallery', 'catalog', 'catalogPDF', 'productVideo',
      'testimonials', 'clientList', 'nfcSettings', 'downloads', 'videos',
      'interactiveElements', 'chatAssistant', 'liveChat'
    ]
  }
};

module.exports = cardFieldsConfig;