const express = require("express");
const router = express.Router();
const authController = require("../controller/authController");
const authMiddleWare = require("../middleware/authMiddleWare");

router.post("/sign-up", authController.signUp);
router.post("/sign-in", authController.login);
router.post("/forgot-password", authController.forgotPassword);
router.patch("/reset-password/:token", authController.resetPassword);
router.get("/email-verification/:token", authController.checkEmailVerification);
router.get(
  "/resend-verfication-email-by-id/:id",
  authController.resendEmailVerficationTokenById
);

router.get(
  "/resend-verfication-email-by-email/:email",
  authController.resendEmailVerficationTokenByEmail
);

router.get("/", authMiddleWare.protect, authController.getUserInfo);
router.patch("/edit-user", authMiddleWare.protect, authController.editUserInfo);
router.patch(
  "/update-password",
  authMiddleWare.protect,
  authController.updatePassword
);

router.post("/verify-token", authController.verifyToken);

module.exports = router;
