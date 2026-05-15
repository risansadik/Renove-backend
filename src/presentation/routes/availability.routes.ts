import { Router } from "express";
import { AvailabilityController } from "../controllers/availability.controller.js";
import { CreateAvailabilityUseCase } from "../../application/use-cases/availability/create-availability.usecase.js";
import { AvailabilityRepository, SlotRepository } from "../../infrastructure/repositories/availability.repository.impl.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = Router();

// DI
const availabilityRepo = new AvailabilityRepository();
const slotRepo = new SlotRepository();
const createAvailabilityUseCase = new CreateAvailabilityUseCase(availabilityRepo, slotRepo);
const controller = new AvailabilityController(createAvailabilityUseCase, slotRepo, availabilityRepo);

// Routes
router.post("/", authenticate, (req, res) => controller.createRule(req, res));
router.get("/my-rules", authenticate, (req, res) => controller.getMyRules(req, res));
router.delete("/:id", authenticate, (req, res) => controller.deleteRule(req, res));
router.get("/slots/:therapistId", (req, res) => controller.getAvailableSlots(req, res));

export default router;
