// Base Personal Allowed Fields (Tier 1)
const personalAllowed = [
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
  'shareableLink'
];

// Business Allowed Fields (Tier 2: Personal + Business features)
const businessAllowed = [
  ...personalAllowed,
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
  'nfcSettings',
  'downloads'
];

// BusinessPremium Allowed Fields (Tier 3: Business + Inquiries, Interactive Elements & Service Areas)
const businessPremiumAllowed = [
  ...businessAllowed,
  'serviceArea',
  'serviceAvailability',
  'customerInquiry',
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
];

// Professionals Allowed Fields (Tier 4: BusinessPremium + Executive Summary & Credentials)
const professionalsAllowed = [
  ...businessPremiumAllowed,
  'testimonials',
  'videos'
];

// ProfessionalPro Allowed Fields (Tier 5: Professionals + Specialized Profiles & Certifications)
const professionalProAllowed = [
  ...professionalsAllowed
];

// Entrepreneurials Allowed Fields (Tier 6: ProfessionalPro + Business Details & Product Showcase)
const entrepreneurialsAllowed = [
  ...professionalProAllowed
];

// EntrepreneurialsMulti Allowed Fields (Tier 7: Entrepreneurials + Multi-Ventures & Projects Hub)
const entrepreneurialsMultiAllowed = [
  ...entrepreneurialsAllowed
];

// CorporateBusiness Allowed Fields (Tier 8: EntrepreneurialsMulti + Multi-Location Branches & Directory)
const corporateBusinessAllowed = [
  ...entrepreneurialsMultiAllowed
];

// Team Allowed Fields (Tier 9: CorporateBusiness + Team Hierarchy & Admin Controls)
const teamAllowed = [
  ...corporateBusinessAllowed
];

// MiniWebsite Allowed Fields (Tier 10: Complete Digital Landing & Mini-Website Presence)
const miniWebsiteAllowed = [
  ...teamAllowed
];

const cardFieldsConfig = {
  Personal: {
    name: 'Personal',
    displayName: 'DI - Individuals',
    description: 'Basic digital card with essential individual features',
    required: ['firstName', 'email'],
    features: [
      'Profile photo, Name, Designation / Title',
      'Tag line, Short intro & Location map',
      'Mobile 1, Mobile 2 & WhatsApp direct connect',
      'Email, Website, Address & Location map',
      'Social Links (LinkedIn, Facebook, Instagram, X/Twitter, Others)',
      'Dynamic QR Code & Instant Contact Share'
    ],
    allowed: personalAllowed,
    addons: []
  },

  Business: {
    name: 'Business',
    displayName: 'DI - Working Professionals',
    description: 'Enhanced features for working professionals & corporate employment',
    required: ['firstName', 'email', 'companyName'],
    features: [
      'Everything in Personal plan, plus:',
      'Employment Details (Company Name, Designation, Role)',
      'Company Logo, Department & Office Address',
      'Products / Services Showcase Overview',
      'Business Hours & Office Availability',
      'Add-On Ready (Photo Gallery, Docs Builder, Portfolio, NFC)'
    ],
    allowed: businessAllowed,
    addons: [
      'Photo Gallery',
      'Docs Builder',
      'Profile/Portfolio Builder',
      'NFC Card'
    ]
  },

  BusinessPremium: {
    name: 'BusinessPremium',
    displayName: 'DI - Service Providers',
    description: 'Dedicated profile for service providers with service areas & customer inquiries',
    required: ['firstName', 'email'],
    features: [
      'Everything in Working Professionals plan, plus:',
      'Dedicated Service Provider Profile & Service Areas',
      'Google Maps Location & Operating Hours',
      'Customer Inquiries (Service, Preferred Date, Preferred Time, Contact)',
      'Services Catalog & Availability Schedule (Days & Hours)',
      'Direct Action CTA & Lead Capture Funnel'
    ],
    allowed: businessPremiumAllowed,
    addons: [
      'Photo Gallery',
      'Docs Builder',
      'NFC Card'
    ]
  },

  Professionals: {
    name: 'Professionals',
    displayName: 'DI - Professionals',
    description: 'Comprehensive executive profile with credentials, portfolio & rich add-on suite',
    required: ['firstName', 'email', 'companyName'],
    features: [
      'Everything in Service Providers plan, plus:',
      'Executive Profile with Certifications & Memberships',
      'Professional Summary (About, Expertise, Services)',
      'Advanced Portfolio Link, Client Testimonials & Video',
      'Document Uploads & Direct Action CTA',
      'Expanded Add-on Suite (Catalog, Brochure & Portfolio Builders)'
    ],
    allowed: professionalsAllowed,
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
    ]
  },

  ProfessionalPro: {
    name: 'ProfessionalPro',
    displayName: 'DI - Professional Pro',
    description: 'Industry specific customized profiles for certified specialists & consultants',
    required: ['firstName', 'email'],
    features: [
      'Everything in Professionals plan, plus:',
      'Industry Specific Custom Layouts & Styling',
      'Specialized Credentials, Certifications & Licenses Display',
      'Advanced Professional Portfolio & Case Studies',
      'Executive Summary & Consultation Booking',
      'Direct WhatsApp, One-Tap Call & Email Action'
    ],
    allowed: professionalProAllowed,
    addons: [
      'Photo Gallery',
      'Docs Builder',
      'Profile Builder',
      'Portfolio Builder',
      'NFC Card',
      'Lead Generation',
      'Appointment Booking'
    ]
  },

  Entrepreneurials: {
    name: 'Entrepreneurials',
    displayName: 'DI - Entrepreneurials',
    description: 'Entrepreneurs showcasing business details, products, services & direct contact',
    required: ['firstName', 'email', 'companyName'],
    features: [
      'Everything in Professional Pro plan, plus:',
      'Comprehensive Business & Role Showcase',
      'Business Details (Company, Designation, Role, Services)',
      'Location, Address, Contact No, Email ID, Website Hub',
      'Dedicated Social Media Hub & Direct Action CTA'
    ],
    allowed: entrepreneurialsAllowed,
    addons: [
      'Photo Gallery',
      'Docs Builder',
      'Profile/Portfolio Builder',
      'NFC Card'
    ]
  },

  EntrepreneurialsMulti: {
    name: 'EntrepreneurialsMulti',
    displayName: 'DI - Multi-Activities',
    description: 'Multi-venture founders showcasing multiple companies, expertise & booking',
    required: ['firstName', 'email'],
    features: [
      'Everything in Entrepreneurials plan, plus:',
      'Multi-Venture & Multi-Brand Showcase (My Ventures +)',
      'Competencies & Expertise Hub (My Expertise +)',
      'Projects & Dynamic Portfolio (My Projects +)',
      'My Services + & My Products + Central Hub',
      'Direct "WhatsApp Me" & "Book Me Direct" Action Triggers'
    ],
    allowed: entrepreneurialsMultiAllowed,
    addons: [
      'Photo Gallery',
      'Docs Builder',
      'NFC Card'
    ]
  },

  CorporateBusiness: {
    name: 'CorporateBusiness',
    displayName: 'DI - Business',
    description: 'Corporate business presence with multi-location branches & team directory',
    required: ['firstName', 'email', 'companyName'],
    features: [
      'Everything in Multi-Activities plan, plus:',
      'Corporate Identity (Logo, Brand Name, Tag line & Intro)',
      'About Business (Overview, Products, Services, Docs Upload)',
      'Multiple Branch Locations & Google Maps Directory',
      'Multiple Contact Persons, Roles & Designations',
      'Corporate Social Media Hub & Direct Inquiry Funnel'
    ],
    allowed: corporateBusinessAllowed,
    addons: [
      'Photo Gallery',
      'Docs Builder',
      'NFC Card'
    ]
  },

  Team: {
    name: 'Team',
    displayName: 'DI - Team',
    description: 'Centralized team organization with sub-cards, brand control & team management',
    required: ['firstName', 'email', 'companyName'],
    features: [
      'Everything in Corporate Business plan, plus:',
      'Multi-Member Team Directory & Organization Hierarchy',
      'Unified Corporate Branding & Theme Control',
      'Individual Team Member Cards with Dedicated URLs',
      'Central Admin Dashboard & Permission Controls',
      'Centralized Lead Capture & Shared Analytics',
      'Bulk Contact Sharing & Corporate QR Codes'
    ],
    allowed: teamAllowed,
    addons: [
      'Photo Gallery',
      'Docs Builder',
      'NFC Card',
      'Analytics',
      'Lead Management'
    ]
  },

  MiniWebsite: {
    name: 'MiniWebsite',
    displayName: 'DP - Mini Website',
    description: 'Full-featured digital mini website with interactive catalogs, maps & lead capture',
    required: ['firstName', 'email', 'companyName'],
    features: [
      'Everything in Team plan, plus:',
      'Full-Featured Digital Mini Website & Landing Presence',
      'Interactive Products & Services Catalog Showcase',
      'Built-in Photo Gallery & Video Streams',
      'Digital Brochures & Document PDF Downloads',
      'Client Testimonials, Google Ratings & Operating Hours',
      'Lead Generation & Interactive Inquiry Webform',
      'Custom Domain/URL & Performance Analytics'
    ],
    allowed: miniWebsiteAllowed,
    addons: [
      'Photo Gallery',
      'Docs Builder',
      'NFC Card',
      'Appointment Booking'
    ]
  }
};

module.exports = cardFieldsConfig;