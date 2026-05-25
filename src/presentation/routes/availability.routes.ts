import { Router } from "express";
import { AvailabilityController } from "../controllers/availability.controller.ts";
import { CreateAvailabilityUseCase } from "../../application/use-cases/availability/create-availability.usecase.ts";
import { AvailabilityRepository, SlotRepository } from "../../infrastructure/repositories/availability.repository.impl.ts";
import { authenticate } from "../middlewares/auth.middleware.ts";

import { GetTherapistRulesUseCase, GetAvailableSlotsUseCase, DeleteAvailabilityRuleUseCase } from "../../application/use-cases/availability/availability-operations.usecase.ts";

const router = Router();

// DI
const availabilityRepo = new AvailabilityRepository();
const slotRepo = new SlotRepository();
const createAvailabilityUseCase = new CreateAvailabilityUseCase(availabilityRepo, slotRepo);
const getTherapistRulesUseCase = new GetTherapistRulesUseCase(availabilityRepo);
const getAvailableSlotsUseCase = new GetAvailableSlotsUseCase(slotRepo);
const deleteAvailabilityRuleUseCase = new DeleteAvailabilityRuleUseCase(availabilityRepo, slotRepo);

const controller = new AvailabilityController(
  createAvailabilityUseCase,
  getTherapistRulesUseCase,
  getAvailableSlotsUseCase,
  deleteAvailabilityRuleUseCase
);

// Routes
router.post("/", authenticate, (req, res) => controller.createRule(req, res));
router.get("/my-rules", authenticate, (req, res) => controller.getTherapistRules(req, res));
router.delete("/:id", authenticate, (req, res) => controller.deleteRule(req, res));
router.get("/slots/:therapistId", (req, res) => controller.getAvailableSlots(req, res));

export default router;
