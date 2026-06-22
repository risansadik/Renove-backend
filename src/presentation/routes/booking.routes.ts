import { Router } from "express";
import { appContainer } from "../../infrastructure/di/container";
import { BookingController } from "../controllers/booking.controller";
import { authenticate } from "../../infrastructure/di/middlewares";
import { TYPES } from "../../shared/constants/tokens";
import { asyncHandler } from "../middlewares/async-handler.middleware";

const router = Router();
const bookingController = appContainer.get<BookingController>(TYPES.BookingController);

// User Routes
router.post("/", authenticate, asyncHandler(bookingController.createBooking));
router.get("/my-sessions", authenticate, asyncHandler(bookingController.getUserBookings));
router.post("/:id/cancel", authenticate, asyncHandler(bookingController.cancelBooking));

// Therapist Routes
router.get("/therapist-sessions", authenticate, asyncHandler(bookingController.getTherapistBookings));
router.patch("/:id/status", authenticate, asyncHandler(bookingController.updateStatus));

export default router;
