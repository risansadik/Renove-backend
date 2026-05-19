import { Router } from "express";
import { adminController } from "../controllers/admin.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
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

export default router;
