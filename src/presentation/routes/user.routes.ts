import { Router } from "express";
import { appContainer } from "../../infrastructure/di/container.ts"; // Import your standalone container
import { TYPES } from "../../shared/constants/tokens.ts";
import { UserAuthController } from "../controllers/user-auth.controller.ts";
import { ProfileController } from "../controllers/profile.controller.ts";
import { UserDashboardController } from "../controllers/user-dashboard.controller.ts";

// Remaining Unchanged Controllers & Middlewares
import { authenticate, authorize } from "../../infrastructure/di/middlewares.ts";
import { validate } from "../middlewares/validate.middleware.ts";
import { upload } from "../middlewares/upload.middleware.ts";
import { asyncHandler } from "../middlewares/async-handler.middleware.ts";

// DTOs & Constants
import { UpdateUserProfileSchema, ChangePasswordSchema } from "../../application/dto/profile/profile.dto.ts";
import {
  ForgotPasswordSchema,
  GoogleAuthSchema,
  LoginUserSchema,
  RegisterUserSchema,
  ResendOtpSchema,
  ResetPasswordSchema,
  VerifyOtpSchema,
} from "../../application/dto/auth/user.dto.ts";
import { ROLES } from "../../shared/constants/index.ts";

const router = Router();

const userAuthController = appContainer.get<UserAuthController>(TYPES.UserAuthController);
const profileController = appContainer.get<ProfileController>(TYPES.ProfileController);
const userDashboardController = appContainer.get<UserDashboardController>(TYPES.UserDashboardController);

router.post("/register", validate(RegisterUserSchema), asyncHandler(userAuthController.register));
router.post("/verify-otp", validate(VerifyOtpSchema), asyncHandler(userAuthController.verifyOtp));
router.post("/resend-otp", validate(ResendOtpSchema), asyncHandler(userAuthController.resendOtp));
router.post("/login", validate(LoginUserSchema), asyncHandler(userAuthController.login));
router.post("/google", validate(GoogleAuthSchema), asyncHandler(userAuthController.googleAuth));
router.post("/forgot-password", validate(ForgotPasswordSchema), asyncHandler(userAuthController.forgotPassword));
router.post("/verify-reset-otp", validate(VerifyOtpSchema), asyncHandler(userAuthController.verifyResetOtp));
router.post("/reset-password", validate(ResetPasswordSchema), asyncHandler(userAuthController.resetPassword));
router.post("/logout", (req, res) => userAuthController.logout(req, res));
router.post("/refresh-token", asyncHandler(userAuthController.refreshToken));

// ── Dashboard (protected) ────────────────────────────────
router.get("/dashboard", authenticate, authorize(ROLES.USER), asyncHandler(userDashboardController.getDashboard));
router.post("/mood", authenticate, authorize(ROLES.USER), asyncHandler(userDashboardController.logMood));
router.patch("/missions/:missionId", authenticate, authorize(ROLES.USER), asyncHandler(userDashboardController.toggleMission));
router.get("/therapists", authenticate, authorize(ROLES.USER), asyncHandler(userDashboardController.getApprovedTherapists));

// ── Profile (protected) ──────────────────────────────────
router.get("/profile", authenticate, authorize(ROLES.USER), asyncHandler(profileController.getUserProfile));
router.patch("/profile", authenticate, authorize(ROLES.USER), upload.single("profileImage"), validate(UpdateUserProfileSchema), asyncHandler(profileController.updateUserProfile));
router.post("/profile/password", authenticate, authorize(ROLES.USER), validate(ChangePasswordSchema), asyncHandler(profileController.changeUserPassword));

export default router;
