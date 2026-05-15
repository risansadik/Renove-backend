import type { TherapistAvailabilityEntity, TherapistSlotEntity } from "../../../domain/entities/TherapistAvailability.entity.js";
import type { IUseCase } from "../IUseCase.js";
import type { CreateAvailabilityDTO } from "../../use-cases/availability/create-availability.usecase.js";

export interface ICreateAvailabilityUseCase extends IUseCase<CreateAvailabilityDTO, TherapistAvailabilityEntity> {}

export interface IGetTherapistRulesUseCase extends IUseCase<string, TherapistAvailabilityEntity[]> {}

export interface IGetAvailableSlotsUseCase extends IUseCase<{ therapistId: string; startDate: Date; endDate: Date }, TherapistSlotEntity[]> {}

export interface IDeleteAvailabilityRuleUseCase extends IUseCase<{ id: string; therapistId: string }, void> {}
