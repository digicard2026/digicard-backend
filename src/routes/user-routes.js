const express = require("express");
const router = express.Router();
const userController = require("../controllers/user-controller");


// -------------------- AUTH & USER --------------------
router.post("/sign-up", userController.signUp);  
router.post("/auto-create-for-card", userController.autoCreateUserForCard);
router.post("/verify-user", userController.verifyUser);         
router.get("/:id", userController.getUserById);             

// -------------------- EMAIL VERIFICATION --------------------
router.get("/verify-email/:token", userController.verifyEmail);              
router.post("/resend-verification-email", userController.resendVerificationEmail);

// -------------------- PASSWORD RESET FLOW --------------------
router.post("/send-reset-link", userController.forgotPassword);           
router.get("/reset-password/:resetToken", userController.verifyResetToken);
router.post("/save-new-password", userController.resetPassword);          

// -------------------- OTHER --------------------
router.post("/logout", userController.logout);                          
router.patch("/:id", userController.updateUserRoleAndComplete);           

module.exports = router;

