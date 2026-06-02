import { Router } from "express";
import { appContainer } from "../../infrastructure/di/container.ts";
import { TYPES } from "../../shared/constants/tokens.ts";
import { TherapistAuthController } from "../controllers/therapist-auth-controller.ts";
import { ProfileController } from "../controllers/profile.controller.ts";
import { TherapistDashboardController } from "../controllers/therapist-dashboard.controller.ts";
import { upload } from "../middlewares/upload.middleware.ts";
import { authenticate, authorize } from "../../infrastructure/di/middlewares.ts";
import { validate } from "../middlewares/validate.middleware.ts";
import { asyncHandler } from "../middlewares/async-handler.middleware.ts";
import { normalizeArrayFields } from "../middlewares/form-normalizer.middleware.ts";
import { UpdateTherapistProfileSchema, ChangePasswordSchema } from "../../application/dto/profile/profile.dto.ts";
import {
  LoginTherapistSchema,
  RegisterTherapistSchema,
  ResendTherapistOtpSchema,
  VerifyTherapistOtpSchema,
} from "../../application/dto/auth/therapist.dto.ts";
import {
  ForgotPasswordSchema,
  ResetPasswordSchema,
  VerifyOtpSchema,
} from "../../application/dto/auth/user.dto.ts";
import { ROLES } from "../../shared/constants/index.ts";

const router = Router();
const therapistAuthController = appContainer.get<TherapistAuthController>(TYPES.TherapistAuthController);
const profileController = appContainer.get<ProfileController>(TYPES.ProfileController);
const therapistDashboardController = appContainer.get<TherapistDashboardController>(TYPES.TherapistDashboardController);

// ── Auth (public) ───────────────────────────────────────
router.post(
  "/register",
  upload.fields([
    { name: "profileImage", maxCount: 1 },
    { name: "certificationFiles", maxCount: 5 }
  ]),
  normalizeArrayFields(["specialization", "certifications"]),
  validate(RegisterTherapistSchema),
  asyncHandler(therapistAuthController.register)
);
router.post("/verify-otp", validate(VerifyTherapistOtpSchema), asyncHandler(therapistAuthController.verifyOtp));
router.post("/resend-otp", validate(ResendTherapistOtpSchema), asyncHandler(therapistAuthController.resendOtp));
router.post("/login", validate(LoginTherapistSchema), asyncHandler(therapistAuthController.login));
router.post("/forgot-password", validate(ForgotPasswordSchema), asyncHandler(therapistAuthController.forgotPassword));
router.post("/verify-reset-otp", validate(VerifyOtpSchema), asyncHandler(therapistAuthController.verifyResetOtp));
router.post("/reset-password", validate(ResetPasswordSchema), asyncHandler(therapistAuthController.resetPassword));
router.post("/logout", therapistAuthController.logout);

// ── Dashboard (protected) ───────────────────────────────
router.get("/dashboard", authenticate, authorize(ROLES.THERAPIST), asyncHandler(therapistDashboardController.getDashboard));

// ── Profile (protected) ───────────────────────────────
router.get("/profile", authenticate, authorize(ROLES.THERAPIST), asyncHandler(profileController.getTherapistProfile));
router.patch(
  "/profile", 
  authenticate, 
  authorize(ROLES.THERAPIST), 
  upload.fields([
    { name: "profileImage", maxCount: 1 },
    { name: "certificationFiles", maxCount: 5 }
  ]),
  normalizeArrayFields(["specialization", "certifications"]),
  validate(UpdateTherapistProfileSchema), 
  asyncHandler(profileController.updateTherapistProfile)
);
router.post("/profile/password", authenticate, authorize(ROLES.THERAPIST), validate(ChangePasswordSchema), asyncHandler(profileController.changeTherapistPassword));

export default router;

