import { Router } from "express";
import { BookingController } from "../controllers/booking.controller.js";
import { CreateBookingUseCase } from "../../application/use-cases/booking/create-booking.usecase.js";
import { GetUserBookingsUseCase, GetTherapistBookingsUseCase, UpdateBookingStatusUseCase } from "../../application/use-cases/booking/get-bookings.usecase.js";
import { BookingRepositoryImpl } from "../../infrastructure/repositories/booking.repository.impl.js";
import { SlotRepository } from "../../infrastructure/repositories/availability.repository.impl.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = Router();

// Dependency Injection
const bookingRepository = new BookingRepositoryImpl();
const slotRepository = new SlotRepository();
const createBookingUseCase = new CreateBookingUseCase(bookingRepository, slotRepository);
const getUserBookingsUseCase = new GetUserBookingsUseCase(bookingRepository);
const getTherapistBookingsUseCase = new GetTherapistBookingsUseCase(bookingRepository);
const updateBookingStatusUseCase = new UpdateBookingStatusUseCase(bookingRepository);

const bookingController = new BookingController(
  createBookingUseCase,
  getUserBookingsUseCase,
  getTherapistBookingsUseCase,
  updateBookingStatusUseCase
);

// User Routes
router.post("/", authenticate, (req, res) => bookingController.createBooking(req, res));
router.get("/my-sessions", authenticate, (req, res) => bookingController.getUserBookings(req, res));

// Therapist Routes
router.get("/therapist-sessions", authenticate, (req, res) => bookingController.getTherapistBookings(req, res));
router.patch("/:id/status", authenticate, (req, res) => bookingController.updateStatus(req, res));

export default router;
