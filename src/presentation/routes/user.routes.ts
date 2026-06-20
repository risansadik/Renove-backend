import { Router } from "express";
import { appContainer } from "../../infrastructure/di/container.ts"; // Import your standalone container
import { TYPES } from "../../shared/constants/tokens.ts";
import { UserAuthController } from "../controllers/user-auth.controller.ts";
import { ProfileController } from "../controllers/profile.controller.ts";
import { UserDashboardController } from "../controllers/user-dashboard.controller.ts";
import { TherapistReviewController } from "../controllers/therapist-review.controller.ts";

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
import { GenerateLevelsSchema } from "../../application/dto/level/level.dto.ts";
import { LevelController } from "../controllers/level.controller.ts";
import { ChatController } from "../controllers/chat.controller.ts";
import { SendMessageSchema } from "../../application/dto/chat/chat.dto.ts";

const router = Router();

const userAuthController = appContainer.get<UserAuthController>(TYPES.UserAuthController);
const profileController = appContainer.get<ProfileController>(TYPES.ProfileController);
const userDashboardController = appContainer.get<UserDashboardController>(TYPES.UserDashboardController);
const therapistReviewController = appContainer.get<TherapistReviewController>(TYPES.TherapistReviewController);
const levelController = appContainer.get<LevelController>(TYPES.LevelController);
const chatController = appContainer.get<ChatController>(TYPES.ChatController);

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

router.post("/levels/generate", authenticate, authorize(ROLES.USER), validate(GenerateLevelsSchema), asyncHandler(levelController.generate));
router.get("/levels", authenticate, authorize(ROLES.USER), asyncHandler(levelController.getLevels));
router.patch("/levels/:levelId/complete", authenticate, authorize(ROLES.USER), asyncHandler(levelController.completeLevel));

router.get("/chat/sessions", authenticate, authorize(ROLES.USER), asyncHandler(chatController.getSessions));
router.post("/chat/sessions", authenticate, authorize(ROLES.USER), asyncHandler(chatController.createSession));
router.delete("/chat/sessions/:sessionId", authenticate, authorize(ROLES.USER), asyncHandler(chatController.deleteSession));
router.get("/chat/sessions/:sessionId/messages", authenticate, authorize(ROLES.USER), asyncHandler(chatController.getSessionMessages));
router.post("/chat/message", authenticate, authorize(ROLES.USER), validate(SendMessageSchema), chatController.streamMessage);

// ── Dashboard (protected) ────────────────────────────────
router.get("/dashboard", authenticate, authorize(ROLES.USER), asyncHandler(userDashboardController.getDashboard));
router.post("/mood", authenticate, authorize(ROLES.USER), asyncHandler(userDashboardController.logMood));
router.patch("/missions/:missionId", authenticate, authorize(ROLES.USER), asyncHandler(userDashboardController.toggleMission));
router.get("/therapists", authenticate, authorize(ROLES.USER), asyncHandler(userDashboardController.getApprovedTherapists));
router.get("/therapists/:therapistId/review", authenticate, authorize(ROLES.USER), asyncHandler(therapistReviewController.getStatus));
router.post("/therapists/:therapistId/review", authenticate, authorize(ROLES.USER), asyncHandler(therapistReviewController.rate));
router.get("/therapists/:therapistId/reviews", authenticate, authorize(ROLES.USER), asyncHandler(therapistReviewController.getReviews));

// ── Profile (protected) ──────────────────────────────────
router.get("/profile", authenticate, authorize(ROLES.USER), asyncHandler(profileController.getUserProfile));
router.patch("/profile", authenticate, authorize(ROLES.USER), upload.single("profileImage"), validate(UpdateUserProfileSchema), asyncHandler(profileController.updateUserProfile));
router.post("/profile/password", authenticate, authorize(ROLES.USER), validate(ChangePasswordSchema), asyncHandler(profileController.changeUserPassword));



export default router;
