import type { Container } from "inversify";
import type {
  IGetAllTherapistsUseCase,
  IGetAllUsersUseCase,
  IUpdateTherapistStatusUseCase,
  IUpdateUserStatusUseCase,
  IGetAdminFinanceStatsUseCase,
  IGetAdminDashboardUseCase,
  IUpdatePlatformSettingsUseCase,
  IGetPendingTherapistUpdatesUseCase,
  IReviewTherapistProfileUseCase
} from "../../../application/interfaces/admin/IAdminUseCase";

import {
  GetAllTherapistsUseCase,
  GetAllUsersUseCase,
  UpdateTherapistStatusUseCase,
  UpdateUserStatusUseCase,
  GetAdminFinanceStatsUseCase,
  GetAdminDashboardUseCase,
  UpdatePlatformSettingsUseCase,
  GetPendingTherapistUpdatesUseCase,
  ReviewTherapistProfileUseCase
} from '../../../application/use-cases/admin/admin.usecase'
import { TYPES } from "../../../shared/constants/tokens";

export const registerAdminModule = (container: Container): void => {
  container.bind<IGetAdminFinanceStatsUseCase>(TYPES.AdminFinanceUseCase).to(GetAdminFinanceStatsUseCase);
  container.bind<IGetAdminDashboardUseCase>(TYPES.GetAdminDashboardUseCase).to(GetAdminDashboardUseCase);
  container.bind<IGetAllTherapistsUseCase>(TYPES.GetAllTherapistsUseCase).to(GetAllTherapistsUseCase)
  container.bind<IGetAllUsersUseCase>(TYPES.GetAllUsersUseCase).to(GetAllUsersUseCase)
  container.bind<IGetPendingTherapistUpdatesUseCase>(TYPES.GetPendingTherapistUpdatesUseCase).to(GetPendingTherapistUpdatesUseCase);
  container.bind<IReviewTherapistProfileUseCase>(TYPES.ReviewTherapistProfileUseCase).to(ReviewTherapistProfileUseCase)
  container.bind<IUpdateTherapistStatusUseCase>(TYPES.UpdateTherapistStatusUseCase).to(UpdateTherapistStatusUseCase);
  container.bind<IUpdateUserStatusUseCase>(TYPES.UpdateUserStatusUseCase).to(UpdateUserStatusUseCase);
  container.bind<IUpdatePlatformSettingsUseCase>(TYPES.UpdatePlatformSettingsUseCase).to(UpdatePlatformSettingsUseCase)
};
