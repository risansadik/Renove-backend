import type { UserJournalEntity } from "../entities/UserJournal.entity.ts";

export interface IUserJournalRepository {
  findAllByUser(userId: string): Promise<UserJournalEntity[]>;
  findById(id: string): Promise<UserJournalEntity | null>;
  create(data: Omit<UserJournalEntity, "id" | "createdAt" | "updatedAt">): Promise<UserJournalEntity>;
  delete(id: string, userId: string): Promise<boolean>;
}
