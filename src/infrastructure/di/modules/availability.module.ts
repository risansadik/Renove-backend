import type { Container } from "inversify";
import type {
  ICreateAvailabilityUseCase,
  IDeleteAvailabilityRuleUseCase,
  IGetAvailableSlotsUseCase,
  IGetTherapistRulesUseCase,
} from "../../../application/interfaces/availability/IAvailabilityUseCase.ts";
import { DeleteAvailabilityRuleUseCase, GetAvailableSlotsUseCase, GetTherapistRulesUseCase } from "../../../application/use-cases/availability/availability-operations.usecase.ts";
import { CreateAvailabilityUseCase } from "../../../application/use-cases/availability/create-availability.usecase.ts";
import type { IAvailabilityRepository, ISlotRepository } from "../../../domain/repositories/availability.repository.ts";
import { AvailabilityController } from "../../../presentation/controllers/availability.controller.ts";
import { TYPES } from "../../../shared/constants/tokens.ts";

export const registerAvailabilityModule = (container: Container): void => {
  container.bind<ICreateAvailabilityUseCase>(TYPES.CreateAvailabilityUseCase).toDynamicValue((context) =>
    new CreateAvailabilityUseCase(
      context.get<IAvailabilityRepository>(TYPES.AvailabilityRepository),
      context.get<ISlotRepository>(TYPES.SlotRepository)
    )
  );
  container.bind<IDeleteAvailabilityRuleUseCase>(TYPES.DeleteAvailabilityRuleUseCase).toDynamicValue((context) =>
    new DeleteAvailabilityRuleUseCase(
      context.get<IAvailabilityRepository>(TYPES.AvailabilityRepository),
      context.get<ISlotRepository>(TYPES.SlotRepository)
    )
  );
  container.bind<IGetAvailableSlotsUseCase>(TYPES.GetAvailableSlotsUseCase).toDynamicValue((context) =>
    new GetAvailableSlotsUseCase(context.get<ISlotRepository>(TYPES.SlotRepository))
  );
  container.bind<IGetTherapistRulesUseCase>(TYPES.GetTherapistRulesUseCase).toDynamicValue((context) =>
    new GetTherapistRulesUseCase(context.get<IAvailabilityRepository>(TYPES.AvailabilityRepository))
  );

  container.bind<AvailabilityController>(TYPES.AvailabilityController).to(AvailabilityController).inSingletonScope();
};
