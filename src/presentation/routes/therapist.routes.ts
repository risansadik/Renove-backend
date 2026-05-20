import { Router } from "express";
import { therapistAuthController } from "../controllers/therapist-auth-controller.js";
import { therapistDashboardController } from "../controllers/therapist-dashboard.controller.js";
import { upload } from "../middlewares/upload.middleware.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { profileController } from "../controllers/profile.controller.js";
import { UpdateTherapistProfileSchema, ChangePasswordSchema } from "../../application/dto/profile/profile.dto.js";
import {
  LoginTherapistSchema,
  RegisterTherapistSchema,
  ResendTherapistOtpSchema,
  VerifyTherapistOtpSchema,
} from "../../application/dto/auth/therapist.dto.js";
import {
  ForgotPasswordSchema,
  ResetPasswordSchema,
  VerifyOtpSchema,
} from "../../application/dto/auth/user.dto.js";
import { ROLES } from "../../shared/constants/index.js";

const router = Router();

// ── Auth (public) ───────────────────────────────────────
router.post(
  "/register",
  upload.fields([
    { name: "profileImage", maxCount: 1 },
    { name: "certificationFiles", maxCount: 5 }
  ]),
  (req, _res, next) => {
    if (typeof req.body.specialization === "string") {
      try { req.body.specialization = JSON.parse(req.body.specialization); }
      catch { req.body.specialization = req.body.specialization.split(",").map((s: string) => s.trim()).filter(Boolean); }
    }
    if (typeof req.body.certifications === "string") {
      try { req.body.certifications = JSON.parse(req.body.certifications); }
      catch { req.body.certifications = req.body.certifications.split(",").map((s: string) => s.trim()).filter(Boolean); }
    }
    next();
  },
  validate(RegisterTherapistSchema),
  therapistAuthController.register
);
router.post("/verify-otp", validate(VerifyTherapistOtpSchema), therapistAuthController.verifyOtp);
router.post("/resend-otp", validate(ResendTherapistOtpSchema), therapistAuthController.resendOtp);
router.post("/login", validate(LoginTherapistSchema), therapistAuthController.login);
router.post("/forgot-password", validate(ForgotPasswordSchema), therapistAuthController.forgotPassword);
router.post("/verify-reset-otp", validate(VerifyOtpSchema), therapistAuthController.verifyResetOtp);
router.post("/reset-password", validate(ResetPasswordSchema), therapistAuthController.resetPassword);
router.post("/logout", therapistAuthController.logout);

// ── Dashboard (protected) ───────────────────────────────
router.get("/dashboard", authenticate, authorize(ROLES.THERAPIST), therapistDashboardController.getDashboard);

// ── Profile (protected) ───────────────────────────────
router.get("/profile", authenticate, authorize(ROLES.THERAPIST), profileController.getTherapistProfile);
router.patch(
  "/profile", 
  authenticate, 
  authorize(ROLES.THERAPIST), 
  upload.fields([
    { name: "profileImage", maxCount: 1 },
    { name: "certificationFiles", maxCount: 5 }
  ]),
  (req, _res, next) => {
    if (typeof req.body.specialization === "string") {
      try { req.body.specialization = JSON.parse(req.body.specialization); }
      catch { req.body.specialization = req.body.specialization.split(",").map((s: string) => s.trim()).filter(Boolean); }
    }
    if (typeof req.body.certifications === "string") {
      try { req.body.certifications = JSON.parse(req.body.certifications); }
      catch { req.body.certifications = req.body.certifications.split(",").map((s: string) => s.trim()).filter(Boolean); }
    }
    next();
  },
  validate(UpdateTherapistProfileSchema), 
  profileController.updateTherapistProfile
);
router.post("/profile/password", authenticate, authorize(ROLES.THERAPIST), validate(ChangePasswordSchema), profileController.changeTherapistPassword);

export default router;

