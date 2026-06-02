import type { Container } from "inversify";
import type {
  ICreateAvailabilityUseCase,
  IDeleteAvailabilityRuleUseCase,
  IGetAvailableSlotsUseCase,
  IGetTherapistRulesUseCase,
} from "../../../application/interfaces/availability/IAvailabilityUseCase.ts";
import {
  CreateAvailabilityUseCase,
  DeleteAvailabilityRuleUseCase,
  GetAvailableSlotsUseCase,
  GetTherapistRulesUseCase,
}
  from '../../../application/use-cases/availability/availability.usecase.ts'

import { AvailabilityController } from "../../../presentation/controllers/availability.controller.ts";
import { TYPES } from "../../../shared/constants/tokens.ts";

export const registerAvailabilityModule = (container: Container): void => {
  container.bind<ICreateAvailabilityUseCase>(TYPES.CreateAvailabilityUseCase).to(CreateAvailabilityUseCase);
  container.bind<IDeleteAvailabilityRuleUseCase>(TYPES.DeleteAvailabilityRuleUseCase).to(DeleteAvailabilityRuleUseCase);
  container.bind<IGetAvailableSlotsUseCase>(TYPES.GetAvailableSlotsUseCase).to(GetAvailableSlotsUseCase);
  container.bind<IGetTherapistRulesUseCase>(TYPES.GetTherapistRulesUseCase).to(GetTherapistRulesUseCase);

  container.bind<AvailabilityController>(TYPES.AvailabilityController).to(AvailabilityController).inSingletonScope();
};
