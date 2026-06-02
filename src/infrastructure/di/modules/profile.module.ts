import type { Container } from "inversify";
import { TYPES } from "../../../shared/constants/tokens.ts";
import { ProfileController } from "../../../presentation/controllers/profile.controller.ts";


import type {
  IChangeAdminPasswordUseCase,
  IChangeTherapistPasswordUseCase,
  IChangeUserPasswordUseCase,
  IGetAdminProfileUseCase,
  IGetTherapistProfileUseCase,
  IGetUserProfileUseCase,
  IUpdateAdminProfileUseCase,
  IUpdateTherapistProfileUseCase,
  IUpdateUserProfileUseCase,
} from "../../../application/interfaces/profile/IProfileUseCase.ts";

import {
  ChangeAdminPasswordUseCase,
  ChangeTherapistPasswordUseCase,
  ChangeUserPasswordUseCase,
  GetAdminProfileUseCase,
  GetTherapistProfileUseCase,
  GetUserProfileUseCase,
  UpdateAdminProfileUseCase,
  UpdateTherapistProfileUseCase,
  UpdateUserProfileUseCase,
} from "../../../application/use-cases/profile/profile.usecase.ts";

export const registerProfileModule = (container: Container): void => {

  container.bind<IChangeAdminPasswordUseCase>(TYPES.ChangeAdminPasswordUseCase).to(ChangeAdminPasswordUseCase);
  container.bind<IChangeTherapistPasswordUseCase>(TYPES.ChangeTherapistPasswordUseCase).to(ChangeTherapistPasswordUseCase);
  container.bind<IChangeUserPasswordUseCase>(TYPES.ChangeUserPasswordUseCase).to(ChangeUserPasswordUseCase);
  container.bind<IGetAdminProfileUseCase>(TYPES.GetAdminProfileUseCase).to(GetAdminProfileUseCase);
  container.bind<IGetTherapistProfileUseCase>(TYPES.GetTherapistProfileUseCase).to(GetTherapistProfileUseCase);
  container.bind<IGetUserProfileUseCase>(TYPES.GetUserProfileUseCase).to(GetUserProfileUseCase);
  container.bind<IUpdateAdminProfileUseCase>(TYPES.UpdateAdminProfileUseCase).to(UpdateAdminProfileUseCase);
  container.bind<IUpdateTherapistProfileUseCase>(TYPES.UpdateTherapistProfileUseCase).to(UpdateTherapistProfileUseCase);
  container.bind<IUpdateUserProfileUseCase>(TYPES.UpdateUserProfileUseCase).to(UpdateUserProfileUseCase);

  container.bind<ProfileController>(TYPES.ProfileController).to(ProfileController).inSingletonScope();
};