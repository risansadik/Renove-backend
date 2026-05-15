import type { Request, Response } from "express";
import type { CreateAvailabilityUseCase } from "../../application/use-cases/availability/create-availability.usecase.js";
import type { GetTherapistRulesUseCase, GetAvailableSlotsUseCase, DeleteAvailabilityRuleUseCase } from "../../application/use-cases/availability/availability-operations.usecase.js";
import { AvailabilityMapper } from "../../application/mappers/availability.mapper.js";
import type { AuthenticatedRequest } from "../../shared/types/express.js";

export class AvailabilityController {
  constructor(
    private _createAvailabilityUseCase: CreateAvailabilityUseCase,
    private _getTherapistRulesUseCase: GetTherapistRulesUseCase,
    private _getAvailableSlotsUseCase: GetAvailableSlotsUseCase,
    private _deleteAvailabilityRuleUseCase: DeleteAvailabilityRuleUseCase
  ) {}

  async createRule(req: Request, res: Response) {
    try {
      const therapistId = (req as AuthenticatedRequest).user.id;
      const data = { ...req.body, therapistId };
      const availability = await this._createAvailabilityUseCase.execute(data);
      res.status(201).json({ success: true, data: AvailabilityMapper.toRulePublicDTO(availability) });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "An unexpected error occurred";
      res.status(400).json({ success: false, message });
    }
  }

  async getTherapistRules(req: Request, res: Response) {
    try {
      const therapistId = (req as AuthenticatedRequest).user.id;
      const rules = await this._getTherapistRulesUseCase.execute(therapistId);
      res.status(200).json({ success: true, data: AvailabilityMapper.toRulePublicDTOList(rules) });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "An unexpected error occurred";
      res.status(500).json({ success: false, message });
    }
  }

  async getAvailableSlots(req: Request, res: Response) {
    try {
      const { start, end } = req.query;

      if (!start || !end) {
        res.status(400).json({ success: false, message: "Start and end dates are required" });
        return;
      }

      const slots = await this._getAvailableSlotsUseCase.execute({
        therapistId: req.params.therapistId,
        startDate: new Date(start as string),
        endDate: new Date(end as string)
      });

      res.status(200).json({ success: true, data: AvailabilityMapper.toSlotPublicDTOList(slots) });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "An unexpected error occurred";
      res.status(500).json({ success: false, message });
    }
  }

  async deleteRule(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const therapistId = (req as AuthenticatedRequest).user.id;
      
      await this._deleteAvailabilityRuleUseCase.execute({ id, therapistId });

      res.status(200).json({ success: true, message: "Rule and available slots deleted" });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "An unexpected error occurred";
      const statusCode = message.includes("not found") ? 404 : 500;
      res.status(statusCode).json({ success: false, message });
    }
  }
}
