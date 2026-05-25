import type { TherapistAvailabilityEntity, TherapistSlotEntity } from "../../../domain/entities/TherapistAvailability.entity.ts";
import type { IUseCase } from "../IUseCase.ts";
import type { CreateAvailabilityDTO } from "../../use-cases/availability/create-availability.usecase.ts";

export type ICreateAvailabilityUseCase = IUseCase<CreateAvailabilityDTO, TherapistAvailabilityEntity>;

export type IGetTherapistRulesUseCase = IUseCase<string, TherapistAvailabilityEntity[]>;

export type IGetAvailableSlotsUseCase = IUseCase<{ therapistId: string; startDate: Date; endDate: Date }, TherapistSlotEntity[]>;

export type IDeleteAvailabilityRuleUseCase = IUseCase<{ id: string; therapistId: string }, void>;
