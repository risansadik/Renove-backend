import type { UserGoalEntity } from "../../../domain/entities/UserGoal.entity";
import type { IUseCase } from "../IUseCase";

export type IGetUserGoalsUseCase = IUseCase<string, UserGoalEntity[]>;

export type ICreateGoalUseCase = IUseCase<
  { userId: string; text: string; category: string; targetDate?: string },
  UserGoalEntity
>;

export type IToggleGoalUseCase = IUseCase<
  { id: string; userId: string },
  UserGoalEntity
>;

export type IDeleteGoalUseCase = IUseCase<
  { id: string; userId: string },
  void
>;
