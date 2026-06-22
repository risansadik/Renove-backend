import type { IUserJournalDocument } from "../databases/schema/user-journal.schema";
import type { UserJournalEntity } from "../../domain/entities/UserJournal.entity";

export class UserJournalDbMapper {
  static toEntity(doc: IUserJournalDocument): UserJournalEntity {
    return {
      id: doc._id.toString(),
      userId: doc.userId.toString(),
      title: doc.title,
      content: doc.content,
      mood: doc.mood,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}
