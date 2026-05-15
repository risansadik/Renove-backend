import { Router } from "express";
import { userAuthController } from "../controllers/user-auth.controller.js";
import { userDashboardController } from "../controllers/user-dashboard.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
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
import { ROLES } from "../../shared/constants/index.js";

const router = Router();

// ── Auth (public) ────────────────────────────────────────
router.post("/register", validate(RegisterUserSchema), userAuthController.register);
router.post("/verify-otp", validate(VerifyOtpSchema), userAuthController.verifyOtp);
router.post("/resend-otp", validate(ResendOtpSchema), userAuthController.resendOtp);
router.post("/login", validate(LoginUserSchema), userAuthController.login);
router.post("/google", validate(GoogleAuthSchema), userAuthController.googleAuth);
router.post("/forgot-password", validate(ForgotPasswordSchema), userAuthController.forgotPassword);
router.post("/verify-reset-otp", validate(VerifyOtpSchema), userAuthController.verifyResetOtp);
router.post("/reset-password", validate(ResetPasswordSchema), userAuthController.resetPassword);
router.post("/logout", userAuthController.logout);
router.post("/refresh-token", userAuthController.refreshToken);

// ── Dashboard (protected) ────────────────────────────────
router.get("/dashboard", authenticate, authorize(ROLES.USER), userDashboardController.getDashboard);
router.post("/mood", authenticate, authorize(ROLES.USER), userDashboardController.logMood);
router.patch("/missions/:missionId", authenticate, authorize(ROLES.USER), userDashboardController.toggleMission);
router.get("/therapists", authenticate, authorize(ROLES.USER), userDashboardController.getApprovedTherapists);

export default router;

