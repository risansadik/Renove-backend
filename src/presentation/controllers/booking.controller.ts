import type { Request, Response } from "express";
import type { CreateBookingUseCase } from "../../application/use-cases/booking/create-booking.usecase.ts";
import type { GetUserBookingsUseCase, GetTherapistBookingsUseCase, UpdateBookingStatusUseCase } from "../../application/use-cases/booking/get-bookings.usecase.ts";
import type { CancelBookingUseCase } from "../../application/use-cases/booking/cancel-booking.usecase.ts";
import { BookingMapper } from "../../application/mappers/booking.mapper.ts";
import type { AuthenticatedRequest } from "../../shared/types/express.ts";

export class BookingController {
  constructor(
    private _createBookingUseCase: CreateBookingUseCase,
    private _getUserBookingsUseCase: GetUserBookingsUseCase,
    private _getTherapistBookingsUseCase: GetTherapistBookingsUseCase,
    private _updateStatusUseCase: UpdateBookingStatusUseCase,
    private _cancelBookingUseCase: CancelBookingUseCase
  ) {}

  async createBooking(req: Request, res: Response) {
    try {
      const userId = (req as AuthenticatedRequest).user.id;
      const booking = await this._createBookingUseCase.execute({ userId, data: req.body });
      res.status(201).json({ success: true, data: BookingMapper.toPublicDTO(booking) });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "An unexpected error occurred";
      res.status(400).json({ success: false, message });
    }
  }

  async getUserBookings(req: Request, res: Response) {
    try {
      const userId = (req as AuthenticatedRequest).user.id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const bookings = await this._getUserBookingsUseCase.execute({ userId, params: { page, limit } });
      const totalPages = Math.ceil(bookings.total / limit);

      res.status(200).json({ 
        success: true, 
        data: BookingMapper.toPublicDTOList(bookings.data),
        meta: {
          total: bookings.total,
          page,
          limit,
          totalPages
        }
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "An unexpected error occurred";
      res.status(500).json({ success: false, message });
    }
  }

  async getTherapistBookings(req: Request, res: Response) {
    try {
      const therapistId = (req as AuthenticatedRequest).user.id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const bookings = await this._getTherapistBookingsUseCase.execute({ therapistId, params: { page, limit } });
      const totalPages = Math.ceil(bookings.total / limit);

      res.status(200).json({ 
        success: true, 
        data: BookingMapper.toPublicDTOList(bookings.data),
        meta: {
          total: bookings.total,
          page,
          limit,
          totalPages
        }
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "An unexpected error occurred";
      res.status(500).json({ success: false, message });
    }
  }

  async updateStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status, rejectionReason } = req.body;
      const booking = await this._updateStatusUseCase.execute({ id, status, rejectionReason });
      
      if (!booking) {
        res.status(404).json({ success: false, message: "Booking not found" });
        return;
      }

      res.status(200).json({ success: true, data: BookingMapper.toPublicDTO(booking) });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "An unexpected error occurred";
      res.status(400).json({ success: false, message });
    }
  }

  async cancelBooking(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const user = (req as AuthenticatedRequest).user;
      
      const cancelledBy = user.role === "therapist" ? "therapist" : "user";
      
      const booking = await this._cancelBookingUseCase.execute({
        bookingId: id,
        cancelledBy,
        userIdOrTherapistId: user.id,
        reason: reason || "No reason provided"
      });

      res.status(200).json({ success: true, data: BookingMapper.toPublicDTO(booking) });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "An unexpected error occurred";
      res.status(400).json({ success: false, message });
    }
  }
}
