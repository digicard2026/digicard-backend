const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const nodemailer = require("nodemailer"); // (used by createTransport util)
const User = require("../models/user.model");
const {
  createTransport,
  createResetEmailTemplate,
  // verifyEmailToken, // not used here
} = require("../utils/email.util");

const {
  createUser,
  findUserByEmail,
  findUserById,
  isValidEmail,
  isValidPassword,
  hashPassword,
  generateResetToken,
  verifyToken,
} = require("../services/user-service");

const JWT_SECRET = process.env.JWT_SECRET;
const FRONTEND_URL = process.env.FRONTEND_URL || "";

// -------------------- SIGN UP --------------------
// exports.signUp = async (req, res) => {
//   try {
//     const { email, password, confirmPassword, selectedPlan } = req.body;

//     if (!email || !password || !confirmPassword)
//       return res.status(400).json({ error: "Email, password, and confirm password are required." });

//     if (!isValidEmail(email))
//       return res.status(400).json({ error: "Invalid email format." });

//     if (!isValidPassword(password))
//       return res.status(400).json({
//         error:
//           "Password must be at least 8 characters long and include uppercase, lowercase, number, and a special character.",
//       });

//     if (password !== confirmPassword)
//       return res.status(400).json({ error: "Passwords do not match." });

//     // createUser service should handle duplicate email and hashing.
//     const user = await createUser({ email, password, selectedPlan });

//     // ensure isVerified default is false (handled in model) but just in case:
//     if (typeof user.isVerified === "undefined") {
//       user.isVerified = false;
//       await user.save();
//     }

//     // send verification email (will set token & expiry and save user again)
//     await sendVerificationEmail(user);

//     return res.status(201).json({
//       message: "User registered successfully. Please check your email to verify your account.",
//       user: {
//         _id: user._id,
//         email: user.email,
//         role: user.role,
//         registrationComplete: user.registrationComplete,
//       },
//     });
//   } catch (err) {
//     console.error("Sign-up error:", err);
//     if (err.message === "EMAIL_EXISTS") {
//       return res.status(409).json({ error: "Email already exists." });
//     }
//     return res.status(500).json({ error: "Internal Server Error" });
//   }
// };


const UserSubscription = require("../models/user-subscription.model");

// -------------------- SIGN UP --------------------
exports.signUp = async (req, res) => {
  try {
    const { email, password, confirmPassword, selectedPlan } = req.body;

    if (!email || !password || !confirmPassword)
      return res.status(400).json({ error: "Email, password, and confirm password are required." });

    if (!isValidEmail(email))
      return res.status(400).json({ error: "Invalid email format." });

    if (!isValidPassword(password))
      return res.status(400).json({
        error:
          "Password must be at least 8 characters long and include uppercase, lowercase, number, and a special character.",
      });

    if (password !== confirmPassword)
      return res.status(400).json({ error: "Passwords do not match." });

    // createUser service handles duplicate email & password hashing
    const user = await createUser({ email, password, selectedPlan });

  
    await sendVerificationEmail(user);


    // -------------------- RESPONSE --------------------
    return res.status(201).json({
      message: "User registered successfully. Please check your email to verify your account.",
      user: {
        _id: user._id,
        email: user.email,
        role: user.role,
        registrationComplete: user.registrationComplete,
      },
    });
  } catch (err) {
    console.error("Sign-up error:", err);
    if (err.message === "EMAIL_EXISTS") {
      return res.status(409).json({ error: "Email already exists." });
    }
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// -------------------- SEND VERIFICATION EMAIL --------------------
const sendVerificationEmail = async (user) => {
  const token = jwt.sign(
    { userId: user._id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );

  user.verificationToken = token;
  await user.save();

  const frontendVerifyLink = `${FRONTEND_URL.replace(/\/$/, "")}/EmailVerify/${token}`;

  const transporter = await createTransport();

  const html = `
    <div style="font-family: Arial, sans-serif; line-height:1.6;">
      <h2>Hello Dear Customer</h2>
      <p>Thanks for registering. Click the button below to verify your email address.</p>
      <p style="margin-top:20px;">
        <a href="${frontendVerifyLink}" style="display:inline-block;padding:10px 18px;background:#2f8fef;color:#fff;text-decoration:none;border-radius:6px;">
          Verify Email
        </a>
      </p>
      <p style="color:#777;font-size:13px;margin-top:18px;">
        This link will expire in 24 hours.
      </p>
    </div>
  `;

  await transporter.sendMail({
    from: `"Revayahone" <${process.env.EMAIL_USER}>`,
    to: user.email,
    subject: "Verify Your Email - Revayahone Digital Card",
    html,
  });

  console.log(`Verification email sent to ${user.email}`);
};


// -------------------- RESEND VERIFICATION EMAIL --------------------
exports.resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email required" });

    const user = await findUserByEmail(email);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (user.isEmailVerified) return res.status(400).json({ error: "Email already verified" });

    await sendVerificationEmail(user);
    res.status(200).json({ message: "Verification email resent successfully." });
  } catch (err) {
    console.error("Resend verification email error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


exports.verifyEmail = async (req, res) => {
  try {
    const token = req.params.token || req.query.token;
    if (!token) {
      return res.status(400).json({ message: "Token missing" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findOne({
      _id: decoded.userId,
      verificationToken: token,
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    user.isEmailVerified = true;
    user.verificationToken = null;
    await user.save();

    /**
     * 🔑 Only create free trial for CUSTOMER users
     */
    if (user.role === "customer") {
      const existingSubscription = await UserSubscription.findOne({ userId: user._id });

      if (!existingSubscription) {
        const trialStart = new Date();
        const trialEnd = new Date();
        trialEnd.setDate(trialEnd.getDate() + 7);

        await UserSubscription.create({
          userId: user._id,
          planId: null,
          subscriptionPlanId: null,
          startDate: trialStart,
          endDate: trialEnd,
          amountPaid: 0,
          status: "active",
        });
      }
    }

    return res.status(200).json({
      message: "🎉 Email verified successfully.",
      emailVerified: true,
      role: user.role,
    });

  } catch (error) {
    console.error("verifyEmail Error:", error);
    return res.status(400).json({ message: "Invalid or expired token" });
  }
};

// -------------------- VERIFY USER / LOGIN --------------------
// exports.verifyUser = async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     if (!email || !password)
//       return res.status(400).json({ message: "Email and password are required." });

//     const user = await findUserByEmail(email);
//     if (!user) return res.status(404).json({ message: "Invalid email or password." });

//     // Block login if not verified
//     if (!user.isVerified) {
//       return res.status(403).json({
//         message: "Email not verified. Please verify your email before logging in.",
//       });
//     }

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) return res.status(401).json({ message: "Invalid email or password." });

//     const token = jwt.sign(
//       { userId: user._id, email: user.email, role: user.role || null },
//       JWT_SECRET,
//       { expiresIn: "1d" }
//     );

//     // adjust cookie options as you need (httpOnly true in production)
//     res.cookie("token", token, { httpOnly: false, secure: false, sameSite: "Strict" });

//     res.status(200).json({
//       user_id: user._id.toString(),
//       role: user.role || null,
//       token,
//       registrationComplete: user.registrationComplete || false,
//       message: "Login successful",
//     });
//   } catch (err) {
//     console.error("Verify user error:", err);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// };

exports.verifyUser = async (req, res) => {
  try {
    const { email, password } = req.body;
 
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }
 
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }
 
    if (!user.isEmailVerified) {
      return res.status(403).json({
        message: "Email not verified. Please verify your email before logging in.",
      });
    }
 
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password." });
    }
 
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role || null,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );
 
    // ✅ KEEP TOKEN NAME AS "token"
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });
 
    res.status(200).json({
      success: true,
      user_id: user._id.toString(),
      role: user.role || null,
      registrationComplete: user.registrationComplete || false,
      message: "Login successful",
    });
 
  } catch (err) {
    console.error("Verify user error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// -------------------- FORGOT PASSWORD --------------------
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required." });

    const user = await findUserByEmail(email);
    if (!user) return res.status(200).json({ message: "If the email exists, a password reset link has been sent." });

    const resetToken = generateResetToken(user._id, JWT_SECRET);
    const resetLink = `${FRONTEND_URL.replace(/\/$/, "")}/reset-password?resetToken=${resetToken}`;
    const transporter = await createTransport();

    await transporter.sendMail({
      from: `"Dg_card" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Password Reset Request - Dg_card",
      html: createResetEmailTemplate(resetLink, user),
    });

    console.log(`Password reset email sent to: ${user.email}`);

    res.status(200).json({ message: "Reset password link has been sent to your email successfully." });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// -------------------- VERIFY RESET TOKEN --------------------
exports.verifyResetToken = async (req, res) => {
  try {
    const { resetToken } = req.params;
    const payload = verifyToken(resetToken, JWT_SECRET);

    const user = await findUserById(payload.userId);
    if (!user) return res.status(404).json({ error: "User not found." });

    res.status(200).json({ message: "Reset token is valid." });
  } catch (err) {
    console.error("Verify reset token error:", err);
    res.status(400).json({ error: "Invalid or expired token." });
  }
};

// -------------------- RESET PASSWORD --------------------
exports.resetPassword = async (req, res) => {
  try {
    const { password, resetToken } = req.body;
    if (!resetToken || !password)
      return res.status(400).json({ error: "Token and password are required." });

    if (!isValidPassword(password))
      return res.status(400).json({
        error: "Password must be at least 8 characters long and include uppercase, lowercase, number and a special character.",
      });

    const payload = verifyToken(resetToken, JWT_SECRET);
    const user = await findUserById(payload.userId);
    if (!user) return res.status(404).json({ error: "User not found." });

    user.password = await hashPassword(password);
    await user.save();

    res.status(200).json({ message: "Password reset successfully." });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// -------------------- GET USER BY ID --------------------
exports.getUserById = async (req, res) => {
  try {
    const user = await findUserById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found." });

    res.status(200).json({ _id: user._id, email: user.email, role: user.role });
  } catch (err) {
    console.error("Get user by ID error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// -------------------- LOGOUT --------------------
exports.logout = (req, res) => {
  res.clearCookie("token", { httpOnly: true, secure: false, sameSite: "Strict" });
  res.status(200).json({ message: "Logged out successfully" });
};

// -------------------- UPDATE ROLE & REGISTRATION STATUS --------------------
exports.updateUserRoleAndComplete = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, registrationComplete } = req.body;

    if (!id) return res.status(400).json({ message: "User ID is required" });

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: { role, registrationComplete } },
      { new: true }
    );

    if (!updatedUser) return res.status(404).json({ message: "User not found" });

    res.status(200).json({
      message: "User role and registration status updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.autoCreateUserForCard = async (req, res) => {
  try {
    const { email, selectedPlan } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, error: "Email is required." });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ success: false, error: "Invalid email format." });
    }

    // Check if user already exists
    let user = await findUserByEmail(email);
    if (!user) {
      // create new user with random password
      const randomPassword = crypto.randomBytes(6).toString("hex"); // temp password
      user = await createUser({ email, password: randomPassword, selectedPlan });

      // create free trial
      const trialStart = new Date();
      const trialEnd = new Date();
      trialEnd.setDate(trialEnd.getDate() + 7);

      await UserSubscription.create({
        userId: user._id,
        planId: null,
        subscriptionPlanId: null,
        startDate: trialStart,
        endDate: trialEnd,
        amountPaid: 0,
        status: "active",
      });

      // send verification email
      await sendVerificationEmail(user);

      return res.status(201).json({
        success: true,
        exists: false,
        message: "User created successfully with 7-day free trial.",
        data: user,
      });
    } else {
      return res.status(200).json({
        success: true,
        exists: true,
        message: "User already exists.",
        data: user,
      });
    }
  } catch (err) {
    console.error("Auto-create user error:", err);
    return res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};
