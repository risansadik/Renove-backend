import type { Container } from "inversify";
import { ChangeAdminPasswordUseCase } from "../../../application/use-cases/profile/change-admin-password.usecase.ts";
import { ChangeTherapistPasswordUseCase } from "../../../application/use-cases/profile/change-therapist-password.usecase.ts";
import { ChangeUserPasswordUseCase } from "../../../application/use-cases/profile/change-user-password.usecase.ts";
import { GetAdminProfileUseCase } from "../../../application/use-cases/profile/get-admin-profile.usecase.ts";
import { GetTherapistProfileUseCase } from "../../../application/use-cases/profile/get-therapist-profile.usecase.ts";
import { GetUserProfileUseCase } from "../../../application/use-cases/profile/get-user-profile.usecase.ts";
import { UpdateAdminProfileUseCase } from "../../../application/use-cases/profile/update-admin-profile.usecase.ts";
import { UpdateTherapistProfileUseCase } from "../../../application/use-cases/profile/update-therapist-profile.usecase.ts";
import { UpdateUserProfileUseCase } from "../../../application/use-cases/profile/update-user-profile.usecase.ts";
import type { IAdminRepository } from "../../../domain/repositories/admin.repository.ts";
import type { ITherapistRepository } from "../../../domain/repositories/therapist.repository.ts";
import type { IUserRepository } from "../../../domain/repositories/user.repository.ts";
import type { IPasswordHasher } from "../../../application/interfaces/services/IPasswordHasher.ts";
import { ProfileController } from "../../../presentation/controllers/profile.controller.ts";
import { TYPES } from "../../../shared/constants/tokens.ts";

export const registerProfileModule = (container: Container): void => {
  container.bind<ChangeAdminPasswordUseCase>(TYPES.ChangeAdminPasswordUseCase).toDynamicValue((context) =>
    new ChangeAdminPasswordUseCase(
      context.get<IAdminRepository>(TYPES.AdminRepository),
      context.get<IPasswordHasher>(TYPES.PasswordHasher)
    )
  );
  container.bind<ChangeTherapistPasswordUseCase>(TYPES.ChangeTherapistPasswordUseCase).toDynamicValue((context) =>
    new ChangeTherapistPasswordUseCase(
      context.get<ITherapistRepository>(TYPES.TherapistRepository),
      context.get<IPasswordHasher>(TYPES.PasswordHasher)
    )
  );
  container.bind<ChangeUserPasswordUseCase>(TYPES.ChangeUserPasswordUseCase).toDynamicValue((context) =>
    new ChangeUserPasswordUseCase(
      context.get<IUserRepository>(TYPES.UserRepository),
      context.get<IPasswordHasher>(TYPES.PasswordHasher)
    )
  );
  container.bind<GetAdminProfileUseCase>(TYPES.GetAdminProfileUseCase).toDynamicValue((context) =>
    new GetAdminProfileUseCase(context.get<IAdminRepository>(TYPES.AdminRepository))
  );
  container.bind<GetTherapistProfileUseCase>(TYPES.GetTherapistProfileUseCase).toDynamicValue((context) =>
    new GetTherapistProfileUseCase(context.get<ITherapistRepository>(TYPES.TherapistRepository))
  );
  container.bind<GetUserProfileUseCase>(TYPES.GetUserProfileUseCase).toDynamicValue((context) =>
    new GetUserProfileUseCase(context.get<IUserRepository>(TYPES.UserRepository))
  );
  container.bind<UpdateAdminProfileUseCase>(TYPES.UpdateAdminProfileUseCase).toDynamicValue((context) =>
    new UpdateAdminProfileUseCase(context.get<IAdminRepository>(TYPES.AdminRepository))
  );
  container.bind<UpdateTherapistProfileUseCase>(TYPES.UpdateTherapistProfileUseCase).toDynamicValue((context) =>
    new UpdateTherapistProfileUseCase(context.get<ITherapistRepository>(TYPES.TherapistRepository))
  );
  container.bind<UpdateUserProfileUseCase>(TYPES.UpdateUserProfileUseCase).toDynamicValue((context) =>
    new UpdateUserProfileUseCase(context.get<IUserRepository>(TYPES.UserRepository))
  );

  container.bind<ProfileController>(TYPES.ProfileController).to(ProfileController).inSingletonScope();
};
