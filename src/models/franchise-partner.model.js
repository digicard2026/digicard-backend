const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Partner Sub-document Schema
const partnerSchema = new Schema({
  partnerId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  businessName: { type: String, required: true },
  businessType: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },

  // Personal Details
  salutation: { type: String },
  firstName: { type: String },
  lastName: { type: String },
  dateOfBirth: { type: Date },
  gender: { type: String },
  personalContact: { type: String },
  personalEmail: { type: String },

  // Address
  addressLine1: { type: String },
  city: { type: String },
  state: { type: String },
  pincode: { type: String },

  // Status
  registrationStep: { type: Number, default: 1 },
  status: { type: String, default: 'pending' },
  kycVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },

  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { _id: true }); // Enable _id so subdocuments support .id(partnerId) and unique subdoc references

const franchisePartnerSchema = new Schema({
  // Basic Identification & Relationship
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  role: {
    type: String,
    enum: ["admin", "franchise", "partner"],
    required: true
  },

  // Franchise Details (only for franchises)
  franchiseDetails: {
    businessName: { type: String },
    businessType: { type: String },
    email: { type: String },
    phone: { type: String },
   
    // Personal Details
    salutation: { type: String },
    firstName: { type: String },
    middleName: { type: String },
    lastName: { type: String },
    dateOfBirth: { type: Date },
    gender: { type: String },
    personalContact: { type: String },
    personalEmail: { type: String },
    aadharNumber: { type: String },
    panNumber: { type: String },
   
    // Address
    addressLine1: { type: String },
    city: { type: String },
    state: { type: String },
    pincode: { type: String },
    country: { type: String, default: 'India' },
   
    // Terms
    acceptTerms: { type: Boolean, default: false },
    acceptPrivacyPolicy: { type: Boolean, default: false },
    acceptCommunication: { type: Boolean, default: false },
   
    // KYC Documents
    aadharFront: { type: String },
    aadharBack: { type: String },
    panCard: { type: String },
    businessProof: { type: String },
   
    // Payment
    paymentStatus: { type: String, default: 'pending' },
    paymentMethod: { type: String },
    transactionId: { type: String },
    amount: { type: Number },
   
    // Agreement
    signedAgreement: { type: String },
    agreementVersion: { type: String, default: '1.0' },
   
    // Registration Progress
    registrationStep: { type: Number, default: 1 },
    status: { type: String, default: 'pending' },
    kycVerified: { type: Boolean, default: false }
  },

  // Nested Partners Array (only for franchises)
  partners: [partnerSchema],

  // Additional Fields
  isActive: { type: Boolean, default: true }

}, {
  timestamps: true
});

// Update the updatedAt for partners when franchise is saved
franchisePartnerSchema.pre('save', function(next) {
  if (this.partners && this.isModified('partners')) {
    this.partners.forEach(partner => {
      partner.updatedAt = new Date();
    });
  }
  next();
});

module.exports = mongoose.model('FranchisePartner', franchisePartnerSchema);