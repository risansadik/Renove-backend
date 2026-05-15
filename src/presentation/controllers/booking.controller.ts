import type { Request, Response } from "express";
import { CreateBookingSchema, UpdateBookingStatusSchema } from "../../application/dto/booking/booking.dto.js";
import type { CreateBookingUseCase } from "../../application/use-cases/booking/create-booking.usecase.js";
import type { GetUserBookingsUseCase, GetTherapistBookingsUseCase, UpdateBookingStatusUseCase } from "../../application/use-cases/booking/get-bookings.usecase.js";

export class BookingController {
  constructor(
    private createBookingUseCase: CreateBookingUseCase,
    private getUserBookingsUseCase: GetUserBookingsUseCase,
    private getTherapistBookingsUseCase: GetTherapistBookingsUseCase,
    private updateBookingStatusUseCase: UpdateBookingStatusUseCase
  ) {}

  async createBooking(req: Request, res: Response) {
    try {
      const validatedData = CreateBookingSchema.parse(req.body);
      const userId = (req as any).user.id;
      const booking = await this.createBookingUseCase.execute(userId, validatedData);
      res.status(201).json({ success: true, data: booking });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getUserBookings(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const bookings = await this.getUserBookingsUseCase.execute(userId);
      res.status(200).json({ success: true, data: bookings });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getTherapistBookings(req: Request, res: Response) {
    try {
      const therapistId = (req as any).user.id;
      const bookings = await this.getTherapistBookingsUseCase.execute(therapistId);
      res.status(200).json({ success: true, data: bookings });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async updateStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const validatedData = UpdateBookingStatusSchema.parse(req.body);
      const booking = await this.updateBookingStatusUseCase.execute(
        id, 
        validatedData.status, 
        validatedData.rejectionReason
      );
      if (!booking) {
        return res.status(404).json({ success: false, message: "Booking not found" });
      }
      res.status(200).json({ success: true, data: booking });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}
