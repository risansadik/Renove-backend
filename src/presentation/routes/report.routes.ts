import { Router } from "express";
import { appContainer } from "../../infrastructure/di/container";
import { TYPES } from "../../shared/constants/tokens";
import { ReportController } from "../controllers/report.controller";
import { authenticate, authorize } from "../../infrastructure/di/middlewares";
import { validate } from "../middlewares/validate.middleware";
import { upload } from "../middlewares/upload.middleware";
import { asyncHandler } from "../middlewares/async-handler.middleware";
import { 
  CreateReportSchema, 
  UpdateReportStatusSchema, 
  AddReportNoteSchema 
} from "../../application/dto/report/report.dto";
import { ROLES } from "../../shared/constants/index";

const router = Router();
const reportController = appContainer.get<ReportController>(TYPES.ReportController);


router.post(
  "/",
  authenticate,
  upload.array("attachments", 5),
  validate(CreateReportSchema),
  asyncHandler(reportController.createReport)
);

router.get(
  "/my",
  authenticate,
  asyncHandler(reportController.getMyReports)
);


router.get(
  "/admin/all",
  authenticate,
  authorize(ROLES.ADMIN),
  asyncHandler(reportController.adminGetAllReports)
);

router.patch(
  "/admin/:id/status",
  authenticate,
  authorize(ROLES.ADMIN),
  validate(UpdateReportStatusSchema),
  asyncHandler(reportController.adminUpdateReportStatus)
);

router.patch(
  "/admin/:id/notes",
  authenticate,
  authorize(ROLES.ADMIN),
  validate(AddReportNoteSchema),
  asyncHandler(reportController.adminAddReportNote)
);


router.get(
  "/:id",
  authenticate,
  asyncHandler(reportController.getReportDetails)
);

export default router;
