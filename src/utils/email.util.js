const nodemailer = require("nodemailer");

// -------------------------
// GET EMAIL CONFIG
// -------------------------
const getEmailConfig = async () => {
  // Use your real email credentials from .env
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    return {
      host: process.env.SMTP_HOST || "mail.revayahone.com",
      port: Number(process.env.SMTP_PORT) || 465,
      secure: process.env.SMTP_SECURE === "true" || true, // port 465 requires secure:true
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    };
  }

  // Fallback to Ethereal only if EMAIL_USER is not set
  const testAccount = await nodemailer.createTestAccount();
  console.log("⚠ Using Ethereal for emails (dev mode)");
  console.log("Ethereal Email:", testAccount.user);
  console.log("Ethereal Pass:", testAccount.pass);

  return {
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  };
};

// -------------------------
// CREATE MAIL TRANSPORT
// -------------------------
const createTransport = async () => {
  const emailConfig = await getEmailConfig();
  return nodemailer.createTransport(emailConfig);
};

// -------------------------
// PASSWORD RESET EMAIL TEMPLATE
// -------------------------
const createResetEmailTemplate = (resetLink, user) => `
<div style="font-family: Arial; max-width: 600px; margin:auto;">
  <div style="background:#3b82f6; padding:20px; color:#fff; text-align:center;">
    <h1>Digi_card</h1>
    <h2>Password Reset Request</h2>
  </div>
  <div style="background:#f9f9f9; padding:20px;">
    <p>Hello ${user.name || user.email || "User"},</p>
    <p>You requested to reset your password for your Digi_card account.</p>
    <p>Click the button below to set a new password:</p>
    <p style="text-align: center;">
      <a href="${resetLink}" style="display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0;">
        Reset Password
      </a>
    </p>
    <p>If the button doesn't work, copy and paste this link into your browser:</p>
    <p style="word-break: break-all;">${resetLink}</p>
    <p><strong>This link will expire in 1 hour.</strong></p>
    <p>If you didn't request this reset, please ignore this email.</p>
  </div>
  <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
    <p>&copy; ${new Date().getFullYear()} Digi_card. All rights reserved.</p>
  </div>
</div>
`;

// -------------------------
// EMAIL VERIFICATION TEMPLATE
// -------------------------
const createVerificationEmailTemplate = (verifyLink, user) => `
<div style="font-family: Arial; max-width: 600px; margin:auto;">
  <div style="background:#10b981; padding:20px; color:#fff; text-align:center;">
    <h1>Digital_card</h1>
    <h2>Email Verification</h2>
  </div>
  <div style="background:#f9f9f9; padding:20px;">
    <p>Hello ${user.name || user.email || "User"},</p>
    <p>Thank you for registering. Please verify your email address by clicking the button below:</p>
    <p style="text-align: center;">
      <a href="${verifyLink}" style="display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0;">
        Verify Email
      </a>
    </p>
    <p>If the button doesn't work, copy and paste this link into your browser:</p>
    <p style="word-break: break-all;">${verifyLink}</p>
    <p><strong>This link will expire in 24 hours.</strong></p>
  </div>
  <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
    <p>&copy; ${new Date().getFullYear()} Digi_card. All rights reserved.</p>
  </div>
</div>
`;

// -------------------------
// EXPORT
// -------------------------
module.exports = {
  getEmailConfig,
  createTransport,
  createResetEmailTemplate,
  createVerificationEmailTemplate,
};
