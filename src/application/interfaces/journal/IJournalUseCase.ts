import type { UserJournalEntity } from "../../../domain/entities/UserJournal.entity";
import type { IUseCase } from "../IUseCase";

export type IGetUserJournalsUseCase = IUseCase<string, UserJournalEntity[]>;

export type ICreateJournalUseCase = IUseCase<
  { userId: string; title: string; content: string; mood: string },
  UserJournalEntity
>;

export type IDeleteJournalUseCase = IUseCase<
  { id: string; userId: string },
  void
>;
