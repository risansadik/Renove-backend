import type { Container } from "inversify";
import type {
  IGetAllTherapistsUseCase,
  IGetAllUsersUseCase,
  IUpdateTherapistStatusUseCase,
  IUpdateUserStatusUseCase,
} from "../../../application/interfaces/admin/IAdminUseCase.ts";
import { GetAdminFinanceStatsUseCase, UpdatePlatformSettingsUseCase } from "../../../application/use-cases/admin/admin-finance.usecase.ts";
import { GetAllTherapistsUseCase } from "../../../application/use-cases/admin/get-all-therapists.usecase.ts";
import { GetAllUsersUseCase } from "../../../application/use-cases/admin/get-all-users.usecase.ts";
import { GetPendingTherapistUpdatesUseCase } from "../../../application/use-cases/admin/get-pending-therapist-updates.usecase.ts";
import { ReviewTherapistProfileUseCase } from "../../../application/use-cases/admin/review-therapist-profile.usecase.ts";
import { UpdateTherapistStatusUseCase } from "../../../application/use-cases/admin/update-therapist-status.usecase.ts";
import { UpdateUserStatusUseCase } from "../../../application/use-cases/admin/update-user-status.usecase.ts";
import type { IFinanceRepository } from "../../../domain/repositories/finance.repository.ts";
import type { ISettingsRepository } from "../../../domain/repositories/settings.repository.ts";
import type { ITherapistRepository } from "../../../domain/repositories/therapist.repository.ts";
import type { IUserRepository } from "../../../domain/repositories/user.repository.ts";
import { TYPES } from "../../../shared/constants/tokens.ts";

export const registerAdminModule = (container: Container): void => {
  container.bind<GetAdminFinanceStatsUseCase>(TYPES.AdminFinanceUseCase).toDynamicValue((context) =>
    new GetAdminFinanceStatsUseCase(
      context.get<ISettingsRepository>(TYPES.SettingsRepository),
      context.get<IFinanceRepository>(TYPES.FinanceRepository)
    )
  );
  container.bind<IGetAllTherapistsUseCase>(TYPES.GetAllTherapistsUseCase).toDynamicValue((context) =>
    new GetAllTherapistsUseCase(context.get<ITherapistRepository>(TYPES.TherapistRepository))
  );
  container.bind<IGetAllUsersUseCase>(TYPES.GetAllUsersUseCase).toDynamicValue((context) =>
    new GetAllUsersUseCase(context.get<IUserRepository>(TYPES.UserRepository))
  );
  container.bind<GetPendingTherapistUpdatesUseCase>(TYPES.GetPendingTherapistUpdatesUseCase).toDynamicValue((context) =>
    new GetPendingTherapistUpdatesUseCase(context.get<ITherapistRepository>(TYPES.TherapistRepository))
  );
  container.bind<ReviewTherapistProfileUseCase>(TYPES.ReviewTherapistProfileUseCase).toDynamicValue((context) =>
    new ReviewTherapistProfileUseCase(context.get<ITherapistRepository>(TYPES.TherapistRepository))
  );
  container.bind<IUpdateTherapistStatusUseCase>(TYPES.UpdateTherapistStatusUseCase).to(UpdateTherapistStatusUseCase);
  container.bind<IUpdateUserStatusUseCase>(TYPES.UpdateUserStatusUseCase).toDynamicValue((context) =>
    new UpdateUserStatusUseCase(context.get<IUserRepository>(TYPES.UserRepository))
  );
  container.bind<UpdatePlatformSettingsUseCase>(TYPES.UpdatePlatformSettingsUseCase).toDynamicValue((context) =>
    new UpdatePlatformSettingsUseCase(context.get<ISettingsRepository>(TYPES.SettingsRepository))
  );
};
