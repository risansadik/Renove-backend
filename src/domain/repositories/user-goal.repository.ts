import type { UserGoalEntity } from "../entities/UserGoal.entity.ts";

export interface IUserGoalRepository {
  findAllByUser(userId: string): Promise<UserGoalEntity[]>;
  findById(id: string): Promise<UserGoalEntity | null>;
  create(data: Omit<UserGoalEntity, "id" | "createdAt" | "updatedAt">): Promise<UserGoalEntity>;
  toggle(id: string, userId: string): Promise<UserGoalEntity | null>;
  delete(id: string, userId: string): Promise<boolean>;
}
