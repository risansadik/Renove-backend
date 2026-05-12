import { Router } from "express";
import { userAuthController } from "../controllers/user-auth.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  ForgotPasswordSchema,
  GoogleAuthSchema,
  LoginUserSchema,
  RegisterUserSchema,
  ResendOtpSchema,
  ResetPasswordSchema,
  VerifyOtpSchema,
} from "../../application/dto/auth/user.dto.js";

const router = Router();

router.post("/register", validate(RegisterUserSchema), userAuthController.register);
router.post("/verify-otp", validate(VerifyOtpSchema), userAuthController.verifyOtp);
router.post("/resend-otp", validate(ResendOtpSchema), userAuthController.resendOtp);
router.post("/login", validate(LoginUserSchema), userAuthController.login);
router.post("/google", validate(GoogleAuthSchema), userAuthController.googleAuth);
router.post("/forgot-password", validate(ForgotPasswordSchema), userAuthController.forgotPassword);
router.post("/reset-password", validate(ResetPasswordSchema), userAuthController.resetPassword);
router.post("/logout", userAuthController.logout);

export default router;
