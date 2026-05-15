import type { Request, Response } from "express";
import type { CreateAvailabilityUseCase } from "../../application/use-cases/availability/create-availability.usecase.js";
import type { ISlotRepository, IAvailabilityRepository } from "../../domain/repositories/availability.repository.js";
import { startOfDay, endOfDay } from "date-fns";

export class AvailabilityController {
  constructor(
    private createAvailabilityUseCase: CreateAvailabilityUseCase,
    private slotRepo: ISlotRepository,
    private availabilityRepo: IAvailabilityRepository
  ) {}

  async createRule(req: Request, res: Response) {
    try {
      const therapistId = (req as any).user.id;
      const data = { ...req.body, therapistId };
      const availability = await this.createAvailabilityUseCase.execute(data);
      res.status(201).json({ success: true, data: availability });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getMyRules(req: Request, res: Response) {
    try {
      const therapistId = (req as any).user.id;
      const rules = await this.availabilityRepo.findByTherapistId(therapistId);
      res.status(200).json({ success: true, data: rules });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getAvailableSlots(req: Request, res: Response) {
    try {
      const { therapistId } = req.params;
      const { start, end } = req.query;

      if (!start || !end) {
        return res.status(400).json({ success: false, message: "Start and end dates are required" });
      }

      const slots = await this.slotRepo.findAvailable(
        therapistId,
        new Date(start as string),
        new Date(end as string)
      );

      res.status(200).json({ success: true, data: slots });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
  async deleteRule(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const therapistId = (req as any).user.id;
      
      const rule = await this.availabilityRepo.findById(id);
      if (!rule || rule.therapistId !== therapistId) {
        return res.status(404).json({ success: false, message: "Rule not found" });
      }

      await this.availabilityRepo.delete(id);
      await this.slotRepo.deleteByAvailabilityId(id);

      res.status(200).json({ success: true, message: "Rule and available slots deleted" });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
