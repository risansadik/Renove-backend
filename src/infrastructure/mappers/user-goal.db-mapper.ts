import type { IUserGoalDocument } from "../databases/schema/user-goal.schema";
import type { UserGoalEntity } from "../../domain/entities/UserGoal.entity";

export class UserGoalDbMapper {
  static toEntity(doc: IUserGoalDocument): UserGoalEntity {
    return {
      id: doc._id.toString(),
      userId: doc.userId.toString(),
      text: doc.text,
      completed: doc.completed,
      category: doc.category,
      targetDate: doc.targetDate,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}
