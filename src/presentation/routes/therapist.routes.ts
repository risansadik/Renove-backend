import { Router } from "express";
import { therapistAuthController } from "../controllers/therapist-auth-controller.js";
import { therapistDashboardController } from "../controllers/therapist-dashboard.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  LoginTherapistSchema,
  RegisterTherapistSchema,
  ResendTherapistOtpSchema,
  VerifyTherapistOtpSchema,
} from "../../application/dto/auth/therapist.dto.js";
import { ROLES } from "../../shared/constants/index.js";

const router = Router();

// ── Auth (public) ───────────────────────────────────────
router.post("/register", validate(RegisterTherapistSchema), therapistAuthController.register);
router.post("/verify-otp", validate(VerifyTherapistOtpSchema), therapistAuthController.verifyOtp);
router.post("/resend-otp", validate(ResendTherapistOtpSchema), therapistAuthController.resendOtp);
router.post("/login", validate(LoginTherapistSchema), therapistAuthController.login);
router.post("/logout", therapistAuthController.logout);

// ── Dashboard (protected) ───────────────────────────────
router.get("/dashboard", authenticate, authorize(ROLES.THERAPIST), therapistDashboardController.getDashboard);

export default router;

