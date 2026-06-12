import { Router } from "express";
import { appContainer } from "../../infrastructure/di/container.ts";
import { AdminController } from "../controllers/admin.controller.ts";
import { ProfileController } from "../controllers/profile.controller.ts";
import { authenticate, authorize } from "../../infrastructure/di/middlewares.ts";
import { validate } from "../middlewares/validate.middleware.ts";
import { upload } from "../middlewares/upload.middleware.ts";
import { asyncHandler } from "../middlewares/async-handler.middleware.ts";
import { UpdateAdminProfileSchema, ChangePasswordSchema, ReviewTherapistUpdateSchema } from "../../application/dto/profile/profile.dto.ts";
import {
  AdminLoginSchema,
  UpdateTherapistStatusSchema,
  UpdateUserStatusSchema,
} from "../../application/dto/auth/admin.dto.ts";
import { ROLES } from "../../shared/constants/index.ts";
import { TYPES } from "../../shared/constants/tokens.ts";

const router = Router();
const adminController = appContainer.get<AdminController>(TYPES.AdminController);
const profileController = appContainer.get<ProfileController>(TYPES.ProfileController);

router.post("/login", validate(AdminLoginSchema), asyncHandler(adminController.login));
router.post("/logout", authenticate, authorize(ROLES.ADMIN), adminController.logout);
router.get("/dashboard", authenticate, authorize(ROLES.ADMIN), asyncHandler(adminController.getDashboard));

router.get("/users", authenticate, authorize(ROLES.ADMIN), asyncHandler(adminController.getAllUsers));
router.patch(
  "/users/:id/status",
  authenticate,
  authorize(ROLES.ADMIN),
  validate(UpdateUserStatusSchema),
  asyncHandler(adminController.updateUserStatus)
);

router.get("/therapists", authenticate, authorize(ROLES.ADMIN), asyncHandler(adminController.getAllTherapists));
router.patch(
  "/therapists/:id/status",
  authenticate,
  authorize(ROLES.ADMIN),
  validate(UpdateTherapistStatusSchema),
  asyncHandler(adminController.updateTherapistStatus)
);

router.get("/finance/stats", authenticate, authorize(ROLES.ADMIN), asyncHandler(adminController.getFinanceStats));
router.patch("/settings/commission", authenticate, authorize(ROLES.ADMIN), asyncHandler(adminController.updateCommission));

// ── Admin Profile ────────────────────────────────────────
router.get("/profile", authenticate, authorize(ROLES.ADMIN), asyncHandler(profileController.getAdminProfile));
router.patch("/profile", authenticate, authorize(ROLES.ADMIN), upload.single("profileImage"), validate(UpdateAdminProfileSchema), asyncHandler(profileController.updateAdminProfile));
router.post("/profile/password", authenticate, authorize(ROLES.ADMIN), validate(ChangePasswordSchema), asyncHandler(profileController.changeAdminPassword));

// ── Pending Therapist Profile Reviews ────────────────────
router.get("/therapists/pending-updates", authenticate, authorize(ROLES.ADMIN), asyncHandler(profileController.getPendingTherapistUpdates));
router.post("/therapists/:id/review-update", authenticate, authorize(ROLES.ADMIN), validate(ReviewTherapistUpdateSchema), asyncHandler(profileController.reviewTherapistUpdate));

export default router;
