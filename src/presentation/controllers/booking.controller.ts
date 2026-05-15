import type { Request, Response } from "express";
import type { CreateBookingUseCase } from "../../application/use-cases/booking/create-booking.usecase.js";
import type { GetUserBookingsUseCase, GetTherapistBookingsUseCase, UpdateBookingStatusUseCase } from "../../application/use-cases/booking/get-bookings.usecase.js";
import { BookingMapper } from "../../application/mappers/booking.mapper.js";
import type { AuthenticatedRequest } from "../../shared/types/express.js";

export class BookingController {
  constructor(
    private createBookingUseCase: CreateBookingUseCase,
    private getUserBookingsUseCase: GetUserBookingsUseCase,
    private getTherapistBookingsUseCase: GetTherapistBookingsUseCase,
    private updateStatusUseCase: UpdateBookingStatusUseCase
  ) {}

  async createBooking(req: Request, res: Response) {
    try {
      const userId = (req as AuthenticatedRequest).user.id;
      const booking = await this.createBookingUseCase.execute({ userId, data: req.body });
      res.status(201).json({ success: true, data: BookingMapper.toPublicDTO(booking) });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "An unexpected error occurred";
      res.status(400).json({ success: false, message });
    }
  }

  async getUserBookings(req: Request, res: Response) {
    try {
      const userId = (req as AuthenticatedRequest).user.id;
      const bookings = await this.getUserBookingsUseCase.execute(userId);
      res.status(200).json({ success: true, data: BookingMapper.toPublicDTOList(bookings) });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "An unexpected error occurred";
      res.status(500).json({ success: false, message });
    }
  }

  async getTherapistBookings(req: Request, res: Response) {
    try {
      const therapistId = (req as AuthenticatedRequest).user.id;
      const bookings = await this.getTherapistBookingsUseCase.execute(therapistId);
      res.status(200).json({ success: true, data: BookingMapper.toPublicDTOList(bookings) });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "An unexpected error occurred";
      res.status(500).json({ success: false, message });
    }
  }

  async updateStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status, rejectionReason } = req.body;
      const booking = await this.updateStatusUseCase.execute({ id, status, rejectionReason });
      
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
}
