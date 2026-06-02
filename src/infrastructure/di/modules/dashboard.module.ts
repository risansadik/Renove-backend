import type { Container } from "inversify";

import type {
  IGetApprovedTherapistsUseCase,
  IGetTherapistDashboardUseCase,
  ILogMoodUseCase,
  IToggleMissionUseCase,
  IGetUserDashboardUseCase
} from '../../../application/interfaces/dashboard/IDashboardUseCase.ts'

import {
  GetApprovedTherapistsUseCase,
  GetUserDashboardUseCase,
  LogMoodUseCase,
  ToggleMissionUseCase,
  GetTherapistDashboardUseCase
} from '../../../application/use-cases/dashboard/dashboard.usecase.ts'
import { TherapistDashboardController } from "../../../presentation/controllers/therapist-dashboard.controller.ts";
import { UserDashboardController } from "../../../presentation/controllers/user-dashboard.controller.ts";
import { TYPES } from "../../../shared/constants/tokens.ts";

export const registerDashboardModule = (container: Container): void => {
  container.bind<IGetApprovedTherapistsUseCase>(TYPES.GetApprovedTherapistsUseCase).to(GetApprovedTherapistsUseCase);
  container.bind<IGetTherapistDashboardUseCase>(TYPES.GetTherapistDashboardUseCase).to(GetTherapistDashboardUseCase);
  container.bind<IGetUserDashboardUseCase>(TYPES.GetUserDashboardUseCase).to(GetUserDashboardUseCase);
  container.bind<ILogMoodUseCase>(TYPES.LogMoodUseCase).to(LogMoodUseCase)
  container.bind<IToggleMissionUseCase>(TYPES.ToggleMissionUseCase).to(ToggleMissionUseCase)

  container.bind<TherapistDashboardController>(TYPES.TherapistDashboardController).to(TherapistDashboardController).inSingletonScope();
  container.bind<UserDashboardController>(TYPES.UserDashboardController).to(UserDashboardController).inSingletonScope();
};
