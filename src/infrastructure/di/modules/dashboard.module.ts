import type { Container } from "inversify";
import { GetTherapistDashboardUseCase } from "../../../application/use-cases/dashboard/therapist-dashboard.usecase.ts";
import { GetApprovedTherapistsUseCase, GetUserDashboardUseCase, LogMoodUseCase, ToggleMissionUseCase } from "../../../application/use-cases/dashboard/user-dashboard.usecase.ts";
import type { IBookingRepository } from "../../../domain/repositories/booking.repository.ts";
import type { ITherapistRepository } from "../../../domain/repositories/therapist.repository.ts";
import type { IUserProgressRepository } from "../../../domain/repositories/user-progress.repository.ts";
import type { IUserRepository } from "../../../domain/repositories/user.repository.ts";
import type { IWalletRepository } from "../../../domain/repositories/wallet.repository.ts";
import { TherapistDashboardController } from "../../../presentation/controllers/therapist-dashboard.controller.ts";
import { UserDashboardController } from "../../../presentation/controllers/user-dashboard.controller.ts";
import { TYPES } from "../../../shared/constants/tokens.ts";

export const registerDashboardModule = (container: Container): void => {
  container.bind<GetApprovedTherapistsUseCase>(TYPES.GetApprovedTherapistsUseCase).toDynamicValue((context) =>
    new GetApprovedTherapistsUseCase(context.get<ITherapistRepository>(TYPES.TherapistRepository))
  );
  container.bind<GetTherapistDashboardUseCase>(TYPES.GetTherapistDashboardUseCase).toDynamicValue((context) =>
    new GetTherapistDashboardUseCase(
      context.get<ITherapistRepository>(TYPES.TherapistRepository),
      context.get<IWalletRepository>(TYPES.WalletRepository),
      context.get<IBookingRepository>(TYPES.BookingRepository),
      context.get<IUserRepository>(TYPES.UserRepository)
    )
  );
  container.bind<GetUserDashboardUseCase>(TYPES.GetUserDashboardUseCase).toDynamicValue((context) =>
    new GetUserDashboardUseCase(
      context.get<IUserProgressRepository>(TYPES.UserProgressRepository),
      context.get<IBookingRepository>(TYPES.BookingRepository)
    )
  );
  container.bind<LogMoodUseCase>(TYPES.LogMoodUseCase).toDynamicValue((context) =>
    new LogMoodUseCase(context.get<IUserProgressRepository>(TYPES.UserProgressRepository))
  );
  container.bind<ToggleMissionUseCase>(TYPES.ToggleMissionUseCase).toDynamicValue((context) =>
    new ToggleMissionUseCase(context.get<IUserProgressRepository>(TYPES.UserProgressRepository))
  );

  container.bind<TherapistDashboardController>(TYPES.TherapistDashboardController).to(TherapistDashboardController).inSingletonScope();
  container.bind<UserDashboardController>(TYPES.UserDashboardController).to(UserDashboardController).inSingletonScope();
};
