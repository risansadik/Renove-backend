import { injectable } from "inversify";
import type { IUserJournalRepository } from "../../domain/repositories/user-journal.repository";
import type { UserJournalEntity } from "../../domain/entities/UserJournal.entity";
import { UserJournalModel } from "../databases/schema/user-journal.schema";
import { UserJournalDbMapper } from "../mappers/user-journal.db-mapper";

@injectable()
export class UserJournalRepository implements IUserJournalRepository {
  async findAllByUser(userId: string): Promise<UserJournalEntity[]> {
    const docs = await UserJournalModel.find({ userId })
      .sort({ createdAt: -1 })
      .exec();
    return docs.map(UserJournalDbMapper.toEntity);
  }

  async findById(id: string): Promise<UserJournalEntity | null> {
    const doc = await UserJournalModel.findById(id).exec();
    return doc ? UserJournalDbMapper.toEntity(doc) : null;
  }

  async create(
    data: Omit<UserJournalEntity, "id" | "createdAt" | "updatedAt">
  ): Promise<UserJournalEntity> {
    const doc = await UserJournalModel.create(data);
    return UserJournalDbMapper.toEntity(doc);
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const result = await UserJournalModel.deleteOne({ _id: id, userId }).exec();
    return result.deletedCount === 1;
  }
}
