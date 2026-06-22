import { injectable } from "inversify";
import type { IUserGoalRepository } from "../../domain/repositories/user-goal.repository";
import type { UserGoalEntity } from "../../domain/entities/UserGoal.entity";
import { UserGoalModel } from "../databases/schema/user-goal.schema";
import { UserGoalDbMapper } from "../mappers/user-goal.db-mapper";

@injectable()
export class UserGoalRepository implements IUserGoalRepository {
  async findAllByUser(userId: string): Promise<UserGoalEntity[]> {
    const docs = await UserGoalModel.find({ userId })
      .sort({ createdAt: -1 })
      .exec();
    return docs.map(UserGoalDbMapper.toEntity);
  }

  async findById(id: string): Promise<UserGoalEntity | null> {
    const doc = await UserGoalModel.findById(id).exec();
    return doc ? UserGoalDbMapper.toEntity(doc) : null;
  }

  async create(
    data: Omit<UserGoalEntity, "id" | "createdAt" | "updatedAt">
  ): Promise<UserGoalEntity> {
    const doc = await UserGoalModel.create(data);
    return UserGoalDbMapper.toEntity(doc);
  }

  async toggle(id: string, userId: string): Promise<UserGoalEntity | null> {
    const doc = await UserGoalModel.findOne({ _id: id, userId }).exec();
    if (!doc) return null;
    doc.completed = !doc.completed;
    await doc.save();
    return UserGoalDbMapper.toEntity(doc);
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const result = await UserGoalModel.deleteOne({ _id: id, userId }).exec();
    return result.deletedCount === 1;
  }
}
