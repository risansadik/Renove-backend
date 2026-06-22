import { inject, injectable } from "inversify";
import type { IUserGoalRepository } from "../../../domain/repositories/user-goal.repository";
import type { UserGoalEntity } from "../../../domain/entities/UserGoal.entity";
import type {
  IGetUserGoalsUseCase,
  ICreateGoalUseCase,
  IToggleGoalUseCase,
  IDeleteGoalUseCase,
} from "../../interfaces/goal/IGoalUseCase";
import { TYPES } from "../../../shared/constants/tokens";
import { NotFoundError } from "../../../shared/utils/AppError";

@injectable()
export class GetUserGoalsUseCase implements IGetUserGoalsUseCase {
  constructor(
    @inject(TYPES.UserGoalRepository)
    private readonly _goalRepo: IUserGoalRepository
  ) {}

  async execute(userId: string): Promise<UserGoalEntity[]> {
    return this._goalRepo.findAllByUser(userId);
  }
}

@injectable()
export class CreateGoalUseCase implements ICreateGoalUseCase {
  constructor(
    @inject(TYPES.UserGoalRepository)
    private readonly _goalRepo: IUserGoalRepository
  ) {}

  async execute({
    userId,
    text,
    category,
    targetDate,
  }: {
    userId: string;
    text: string;
    category: string;
    targetDate?: string;
  }): Promise<UserGoalEntity> {
    return this._goalRepo.create({ userId, text, category, targetDate, completed: false });
  }
}

@injectable()
export class ToggleGoalUseCase implements IToggleGoalUseCase {
  constructor(
    @inject(TYPES.UserGoalRepository)
    private readonly _goalRepo: IUserGoalRepository
  ) {}

  async execute({ id, userId }: { id: string; userId: string }): Promise<UserGoalEntity> {
    const updated = await this._goalRepo.toggle(id, userId);
    if (!updated) throw new NotFoundError("Goal");
    return updated;
  }
}

@injectable()
export class DeleteGoalUseCase implements IDeleteGoalUseCase {
  constructor(
    @inject(TYPES.UserGoalRepository)
    private readonly _goalRepo: IUserGoalRepository
  ) {}

  async execute({ id, userId }: { id: string; userId: string }): Promise<void> {
    const deleted = await this._goalRepo.delete(id, userId);
    if (!deleted) throw new NotFoundError("Goal");
  }
}
