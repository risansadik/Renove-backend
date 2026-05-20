import { Router } from "express";
import { adminController } from "../controllers/admin.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { upload } from "../middlewares/upload.middleware.js";
import { profileController } from "../controllers/profile.controller.js";
import { UpdateAdminProfileSchema, ChangePasswordSchema, ReviewTherapistUpdateSchema } from "../../application/dto/profile/profile.dto.js";
import {
  AdminLoginSchema,
  UpdateTherapistStatusSchema,
  UpdateUserStatusSchema,
} from "../../application/dto/auth/admin.dto.js";
import { ROLES } from "../../shared/constants/index.js";

const router = Router();

router.post("/login", validate(AdminLoginSchema), adminController.login);
router.post("/logout", authenticate, authorize(ROLES.ADMIN), adminController.logout);

router.get("/users", authenticate, authorize(ROLES.ADMIN), adminController.getAllUsers);
router.patch(
  "/users/:id/status",
  authenticate,
  authorize(ROLES.ADMIN),
  validate(UpdateUserStatusSchema),
  adminController.updateUserStatus
);

router.get("/therapists", authenticate, authorize(ROLES.ADMIN), adminController.getAllTherapists);
router.patch(
  "/therapists/:id/status",
  authenticate,
  authorize(ROLES.ADMIN),
  validate(UpdateTherapistStatusSchema),
  adminController.updateTherapistStatus
);

router.get("/finance/stats", authenticate, authorize(ROLES.ADMIN), adminController.getFinanceStats);
router.patch("/settings/commission", authenticate, authorize(ROLES.ADMIN), adminController.updateCommission);

// ── Admin Profile ────────────────────────────────────────
router.get("/profile", authenticate, authorize(ROLES.ADMIN), profileController.getAdminProfile);
router.patch("/profile", authenticate, authorize(ROLES.ADMIN), upload.single("profileImage"), validate(UpdateAdminProfileSchema), profileController.updateAdminProfile);
router.post("/profile/password", authenticate, authorize(ROLES.ADMIN), validate(ChangePasswordSchema), profileController.changeAdminPassword);

// ── Pending Therapist Profile Reviews ────────────────────
router.get("/therapists/pending-updates", authenticate, authorize(ROLES.ADMIN), profileController.getPendingTherapistUpdates);
router.post("/therapists/:id/review-update", authenticate, authorize(ROLES.ADMIN), validate(ReviewTherapistUpdateSchema), profileController.reviewTherapistUpdate);

export default router;
