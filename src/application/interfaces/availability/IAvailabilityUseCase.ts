import type { TherapistAvailabilityEntity, TherapistSlotEntity } from "../../../domain/entities/TherapistAvailability.entity.js";
import type { IUseCase } from "../IUseCase.js";
import type { CreateAvailabilityDTO } from "../../use-cases/availability/create-availability.usecase.js";

export type ICreateAvailabilityUseCase = IUseCase<CreateAvailabilityDTO, TherapistAvailabilityEntity>;

export type IGetTherapistRulesUseCase = IUseCase<string, TherapistAvailabilityEntity[]>;

export type IGetAvailableSlotsUseCase = IUseCase<{ therapistId: string; startDate: Date; endDate: Date }, TherapistSlotEntity[]>;

export type IDeleteAvailabilityRuleUseCase = IUseCase<{ id: string; therapistId: string }, void>;
