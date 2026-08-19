
const mongoose = require('mongoose');

const emailSchema = new mongoose.Schema({
  label: { 
    type: String, 
    required: true, 
    enum: ['work', 'personal', 'other', 'executive', 'primary', 'secondary', 'sales', 'support', 'billing'] 
  },
  address: { type: String, required: true }
});

const phoneSchema = new mongoose.Schema({
  label: { 
    type: String, 
    required: true, 
    enum: ['work', 'personal', 'mobile', 'other', 'assistant', 'fax', 'home', 'office', 'direct', 'main'] 
  },
  number: { type: String, required: true }
});

const websiteSchema = new mongoose.Schema({
  label: { 
    type: String, 
    required: true, 
    enum: ['personal', 'work', 'portfolio', 'other', 'company', 'blog', 'shop', 'documentation', 'support', 'booking'] 
  },
  url: { type: String, required: true }
});

const socialLinkSchema = new mongoose.Schema({
  platform: { 
    type: String, 
    required: true, 
    enum: [
      'linkedin', 'twitter', 'facebook', 'instagram', 'youtube', 
      'github', 'whatsapp', 'telegram', 'website', 'tiktok',
      'dribbble', 'behance', 'pinterest', 'snapchat', 'reddit',
      'medium', 'skype', 'discord', 'slack', 'zoom'
    ] 
  },
  url: { type: String, required: true }
});

const serviceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number },
  currency: { type: String, default: 'USD' },
  duration: { type: String },
  category: { type: String, enum: ['design', 'development', 'consulting', 'marketing', 'training', 'other', 'support', 'maintenance', 'strategy'] },
  image: { type: String }
});

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number },
  currency: { type: String, default: 'USD' },
  category: { type: String, enum: ['digital', 'physical', 'software', 'book', 'course', 'other', 'service', 'subscription', 'hardware'] },
  image: { type: String },
  inStock: { type: Boolean, default: true }
});

const customFieldSchema = new mongoose.Schema({
  label: { type: String, required: true },
  value: { type: String, required: true },
  fieldType: { type: String, enum: ['text', 'number', 'date', 'url', 'email', 'phone', 'textarea'], default: 'text' }
});

// CORRECTED: Added uploadType to profileVideoSchema
const profileVideoSchema = new mongoose.Schema({
  url: { type: String, required: true },
  thumbnail: { type: String },
  title: { type: String },
  uploadType: { type: String, enum: ['url', 'upload'], default: 'url' } // ADDED
});

const interactiveElementSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: [
      'call-to-action',
      'shop-flow',
      'show-leads',
      'live-chat',
      'appointment-scheduler',
      'digital-payments',
      'lead-form',
      'contact-form',
      'language-switcher',
      'booking-system',
      'newsletter-signup',
      'file-download'
    ]
  },
  config: { type: Object },
  isActive: { type: Boolean, default: true },
  position: { type: Number, default: 0 }
});

const qrCodeSchema = new mongoose.Schema({
  type: { type: String, enum: ['dynamic', 'static'], default: 'dynamic' },
  targetUrl: { type: String, required: true },
  qrImage: { type: String },
  scans: { type: Number, default: 0 },
  lastScanned: { type: Date }
});

const nfcSchema = new mongoose.Schema({
  isEnabled: { type: Boolean, default: false },
  nfcId: { type: String },
  lastUsed: { type: Date }
});

const galleryItemSchema = new mongoose.Schema({
  type: { type: String, enum: ['image', 'video', 'document', 'audio', 'pdf'], required: true },
  url: { type: String, required: true },
  thumbnail: { type: String },
  title: { type: String },
  description: { type: String },
  category: { type: String },
  uploadType: { type: String, enum: ['url', 'upload'], default: 'url' } // ADDED
});

const downloadSchema = new mongoose.Schema({
  name: { type: String },
  fileUrl: { type: String, },
  fileType: { type: String },
  fileSize: { type: String },
  downloadCount: { type: Number, default: 0 },
  uploadType: { type: String, enum: ['url', 'upload'], default: 'url' }, // ADDED
  fileData: { type: String } // ADDED for base64 uploads
});

const testimonialSchema = new mongoose.Schema({
  clientName: { type: String, required: true },
  testimonial: { type: String, required: true },
  rating: { type: Number, min: 1, max: 5 },
  date: { type: Date },
  company: { type: String },
  position: { type: String }
});

const businessHoursSchema = new mongoose.Schema({
  day: { 
    type: String, 
    required: true,
    enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
  },
  openingTime: { type: String },
  closingTime: { type: String },
  isClosed: { type: Boolean, default: false }
});

const virtualNumberSchema = new mongoose.Schema({
  number: { type: String },
  isEnabled: { type: Boolean, default: false },
  label: { type: String },
  costPerMinute: { type: Number }
});

// ========== NEW SCHEMAS FOR MISSING FIELDS ==========
// ADDED: Product Video Schema (was missing)
const productVideoSchema = new mongoose.Schema({
  url: { type: String },
  thumbnail: { type: String },
  title: { type: String },
  uploadType: { type: String, enum: ['url', 'upload'], default: 'url' }
});

// ADDED: Videos Schema (was completely missing)
const videoSchema = new mongoose.Schema({
  type: { type: String, enum: ['youtube', 'vimeo', 'direct'], default: 'youtube' },
  url: { type: String, required: true },
  thumbnail: { type: String },
  title: { type: String },
  description: { type: String },
  uploadType: { type: String, enum: ['url', 'upload'], default: 'url' },
  videoData: { type: String } // For base64 video uploads
});

// ADDED: Chat Assistant Schema (was completely missing)
const chatAssistantSchema = new mongoose.Schema({
  isEnabled: { type: Boolean, default: false },
  welcomeMessage: { type: String, default: 'Hello! How can I help you today?' },
  responses: [{
    keyword: String,
    response: String
  }]
});

// ADDED: Live Chat Schema (was completely missing)
const liveChatSchema = new mongoose.Schema({
  isEnabled: { type: Boolean, default: false },
  platform: { type: String, enum: ['whatsapp', 'messenger', 'telegram'], default: 'whatsapp' },
  phoneNumber: { type: String }
});
// ========== END NEW SCHEMAS ==========

const cardSchema = new mongoose.Schema({
  // Personal Info
  prefix: { type: String },
  firstName: { type: String, required: true },
  lastName: { type: String },
  suffix: { type: String },
  profilePhoto: { type: String },
  
  // Video Fields
  profileVideo: profileVideoSchema,
  tagline: { type: String },
  foundedName: { type: String },
  organization: { type: String },
  aboutText: { type: String },
  
  // Email Fields
  email: { type: String, required: true },
  emails: [emailSchema],
  
  // URL Customization Fields
  customUrl: { 
    type: String, 
    trim: true,
    sparse: true
  },
  shareableUrl: { 
    type: String, 
    trim: true 
  },
  urlSlug: { 
    type: String, 
    trim: true,
    unique: true,
    sparse: true
  },
  isPublic: { 
    type: Boolean, 
    default: true 
  },
  
  // Company Details
  companyName: { type: String },
  department: { type: String },
  jobTitle: { type: String },
  bio: { type: String },
  companyLogo: { type: String },
  logoSize: { type: String, default: 'medium', enum: ['small', 'medium', 'large', 'xlarge'] },
  
  // Product/Service Fields
  servicesProducts: { type: String },
  brandLabel: { type: String },
  productRangeDisplay: { type: String, enum: ['grid', 'list', 'carousel'], default: 'grid' },
  testimonials: [testimonialSchema],
  clientList: [{ type: String }],
  gallery: [galleryItemSchema],
  catalog: { type: String },
  catalogPDF: { type: String }, // ADDED: Missing field
  
  // Contact Details
  phones: [phoneSchema],
  websites: [websiteSchema],
  socialLinks: [socialLinkSchema],
  customFields: [customFieldSchema],
  addresses: [{
    label: { 
      type: String, 
      required: true, 
      enum: ['office', 'home', 'headquarters', 'branch', 'other', 'warehouse', 'store', 'factory'] 
    },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String },
    country: { type: String, required: true },
    postalCode: { type: String },
    fullAddress: { type: String },
    googleMapsLink: { type: String },
    isPrimary: { type: Boolean, default: false }
  }],
  
  // Business Hours
  businessHours: [businessHoursSchema],
  
  // Virtual Number
  virtualNumber: {
  type: mongoose.Schema.Types.Mixed,
  default: null
},
  
  // Product Video - CORRECTED: Changed from String to Object
  productVideo: productVideoSchema,
  
  // Individual Product Display
  individualProductDisplay: { type: Boolean, default: false },
  
  // BusinessPremium additional fields
  businessCardInstagram: { type: String },
  textbooks: { type: String },
  
  // Interactive Features
  interactiveElements: [interactiveElementSchema],
  dynamicQRCode: qrCodeSchema,
  nfcSettings: nfcSchema,
  
  // Services & Products
  services: [serviceSchema],
  products: [productSchema],
  
  // Downloadable Content
  downloads: [downloadSchema],
  
  // ========== ADDED: Missing Fields from Component ==========
  videos: [videoSchema], // ADDED: Videos array
  chatAssistant: chatAssistantSchema, // ADDED: Chat assistant
  liveChat: liveChatSchema, // ADDED: Live chat
  
  // Contact Management Toggles - ADDED
  enableOneTapCall: { type: Boolean, default: true },
  enableWhatsApp: { type: Boolean, default: true },
  enableEmail: { type: Boolean, default: true },
  // ========== END ADDED FIELDS ==========
  
  // Design
  design: { 
    type: String, 
    default: 'default', 
    enum: ['default', 'modern', 'dark', 'light', 'professional', 'creative', 'minimal', 'bold'] 
  },
  cardLayout: { 
    type: String, 
    default: 'standard',
    enum: ['standard', 'premium', 'minimal', 'detailed', 'interactive'] 
  },
  
  // Card Type/Plan
  cardType: {
    type: String,
    enum: ['Personal', 'Business', 'BusinessPremium'],
    default: 'Personal'
  },
  
  // Metadata
  isPublished: { type: Boolean, default: false },
  lastSaved: { type: Date, default: Date.now },
  autoSaveData: { type: Object },
  
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },

  // Analytics
  views: { type: Number, default: 0 },
  qrScans: { type: Number, default: 0 },
  nfcTaps: { type: Number, default: 0 },
  contactDownloads: { type: Number, default: 0 },
  
  // Sharing
  shareableLink: { type: String }
}, {
  timestamps: true
});

// Indexes
cardSchema.index({ shareableLink: 1 });
cardSchema.index({ email: 1 });
cardSchema.index({ isPublic: 1 });
cardSchema.index({ cardType: 1 });

// Virtual for full name
cardSchema.virtual('fullName').get(function() {
  return `${this.prefix ? this.prefix + ' ' : ''}${this.firstName} ${this.lastName}${this.suffix ? ' ' + this.suffix : ''}`.trim();
});

module.exports = mongoose.model('Card', cardSchema);