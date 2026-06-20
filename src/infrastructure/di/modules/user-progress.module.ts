import type { Container } from "inversify";
import type {
  IGetUserJournalsUseCase,
  ICreateJournalUseCase,
  IDeleteJournalUseCase,
} from "../../../application/interfaces/journal/IJournalUseCase.ts";
import type {
  IGetUserGoalsUseCase,
  ICreateGoalUseCase,
  IToggleGoalUseCase,
  IDeleteGoalUseCase,
} from "../../../application/interfaces/goal/IGoalUseCase.ts";
import {
  GetUserJournalsUseCase,
  CreateJournalUseCase,
  DeleteJournalUseCase,
} from "../../../application/use-cases/journal/journal.usecase.ts";
import {
  GetUserGoalsUseCase,
  CreateGoalUseCase,
  ToggleGoalUseCase,
  DeleteGoalUseCase,
} from "../../../application/use-cases/goal/goal.usecase.ts";
import { UserProgressController } from "../../../presentation/controllers/user-progress.controller.ts";
import { TYPES } from "../../../shared/constants/tokens.ts";

export const registerUserProgressModule = (container: Container): void => {
  // Use Cases — Journals
  container.bind<IGetUserJournalsUseCase>(TYPES.GetUserJournalsUseCase).to(GetUserJournalsUseCase);
  container.bind<ICreateJournalUseCase>(TYPES.CreateJournalUseCase).to(CreateJournalUseCase);
  container.bind<IDeleteJournalUseCase>(TYPES.DeleteJournalUseCase).to(DeleteJournalUseCase);

  // Use Cases — Goals
  container.bind<IGetUserGoalsUseCase>(TYPES.GetUserGoalsUseCase).to(GetUserGoalsUseCase);
  container.bind<ICreateGoalUseCase>(TYPES.CreateGoalUseCase).to(CreateGoalUseCase);
  container.bind<IToggleGoalUseCase>(TYPES.ToggleGoalUseCase).to(ToggleGoalUseCase);
  container.bind<IDeleteGoalUseCase>(TYPES.DeleteGoalUseCase).to(DeleteGoalUseCase);

  // Controller
  container
    .bind<UserProgressController>(TYPES.UserProgressController)
    .to(UserProgressController)
    .inSingletonScope();
};
