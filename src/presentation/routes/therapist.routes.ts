import { Router } from "express";
import { appContainer } from "../../infrastructure/di/container";
import { TYPES } from "../../shared/constants/tokens";
import { TherapistAuthController } from "../controllers/therapist-auth-controller";
import { ProfileController } from "../controllers/profile.controller";
import { TherapistDashboardController } from "../controllers/therapist-dashboard.controller";
import { upload } from "../middlewares/upload.middleware";
import { authenticate, authorize } from "../../infrastructure/di/middlewares";
import { validate } from "../middlewares/validate.middleware";
import { asyncHandler } from "../middlewares/async-handler.middleware";
import { normalizeArrayFields } from "../middlewares/form-normalizer.middleware";
import { UpdateTherapistProfileSchema, ChangePasswordSchema } from "../../application/dto/profile/profile.dto";
import {
  LoginTherapistSchema,
  RegisterTherapistSchema,
  ResendTherapistOtpSchema,
  VerifyTherapistOtpSchema,
} from "../../application/dto/auth/therapist.dto";
import {
  ForgotPasswordSchema,
  ResetPasswordSchema,
  VerifyOtpSchema,
} from "../../application/dto/auth/user.dto";
import { ROLES } from "../../shared/constants/index";
import { TherapistReviewController } from "../controllers/therapist-review.controller";

const router = Router();
const therapistAuthController = appContainer.get<TherapistAuthController>(TYPES.TherapistAuthController);
const profileController = appContainer.get<ProfileController>(TYPES.ProfileController);
const therapistDashboardController = appContainer.get<TherapistDashboardController>(TYPES.TherapistDashboardController);
const therapistReviewController = appContainer.get<TherapistReviewController>(TYPES.TherapistReviewController);

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
router.get("/reviews", authenticate, authorize(ROLES.THERAPIST), asyncHandler(therapistReviewController.getOwnReviews));

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

