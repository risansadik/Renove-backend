import { Router } from "express";
import { BookingController } from "../controllers/booking.controller.ts";
import { CreateBookingUseCase } from "../../application/use-cases/booking/create-booking.usecase.ts";
import { GetUserBookingsUseCase, GetTherapistBookingsUseCase, UpdateBookingStatusUseCase } from "../../application/use-cases/booking/get-bookings.usecase.ts";
import { CancelBookingUseCase } from "../../application/use-cases/booking/cancel-booking.usecase.ts";
import { BookingRepositoryImpl } from "../../infrastructure/repositories/booking.repository.impl.ts";
import { SlotRepository } from "../../infrastructure/repositories/availability.repository.impl.ts";
import { WalletRepositoryImpl } from "../../infrastructure/repositories/wallet.repository.impl.ts";
import { PaymentRepositoryImpl } from "../../infrastructure/repositories/payment.repository.impl.ts";
import { authenticate } from "../middlewares/auth.middleware.ts";

const router = Router();

// Dependency Injection
const bookingRepository = new BookingRepositoryImpl();
const slotRepository = new SlotRepository();
const walletRepository = new WalletRepositoryImpl();
const paymentRepository = new PaymentRepositoryImpl();

const createBookingUseCase = new CreateBookingUseCase(bookingRepository, slotRepository);
const getUserBookingsUseCase = new GetUserBookingsUseCase(bookingRepository);
const getTherapistBookingsUseCase = new GetTherapistBookingsUseCase(bookingRepository);
const updateBookingStatusUseCase = new UpdateBookingStatusUseCase(
  bookingRepository,
  walletRepository,
  paymentRepository
);
const cancelBookingUseCase = new CancelBookingUseCase(
  bookingRepository,
  slotRepository,
  walletRepository,
  paymentRepository
);

const bookingController = new BookingController(
  createBookingUseCase,
  getUserBookingsUseCase,
  getTherapistBookingsUseCase,
  updateBookingStatusUseCase,
  cancelBookingUseCase
);

// User Routes
router.post("/", authenticate, (req, res) => bookingController.createBooking(req, res));
router.get("/my-sessions", authenticate, (req, res) => bookingController.getUserBookings(req, res));
router.post("/:id/cancel", authenticate, (req, res) => bookingController.cancelBooking(req, res));

// Therapist Routes
router.get("/therapist-sessions", authenticate, (req, res) => bookingController.getTherapistBookings(req, res));
router.patch("/:id/status", authenticate, (req, res) => bookingController.updateStatus(req, res));

export default router;
