import { inject, injectable } from "inversify";
import type { IUserJournalRepository } from "../../../domain/repositories/user-journal.repository.ts";
import type { UserJournalEntity } from "../../../domain/entities/UserJournal.entity.ts";
import type {
  IGetUserJournalsUseCase,
  ICreateJournalUseCase,
  IDeleteJournalUseCase,
} from "../../interfaces/journal/IJournalUseCase.ts";
import { TYPES } from "../../../shared/constants/tokens.ts";
import { NotFoundError } from "../../../shared/utils/AppError.ts";

@injectable()
export class GetUserJournalsUseCase implements IGetUserJournalsUseCase {
  constructor(
    @inject(TYPES.UserJournalRepository)
    private readonly _journalRepo: IUserJournalRepository
  ) {}

  async execute(userId: string): Promise<UserJournalEntity[]> {
    return this._journalRepo.findAllByUser(userId);
  }
}

@injectable()
export class CreateJournalUseCase implements ICreateJournalUseCase {
  constructor(
    @inject(TYPES.UserJournalRepository)
    private readonly _journalRepo: IUserJournalRepository
  ) {}

  async execute({
    userId,
    title,
    content,
    mood,
  }: {
    userId: string;
    title: string;
    content: string;
    mood: string;
  }): Promise<UserJournalEntity> {
    return this._journalRepo.create({ userId, title, content, mood });
  }
}

@injectable()
export class DeleteJournalUseCase implements IDeleteJournalUseCase {
  constructor(
    @inject(TYPES.UserJournalRepository)
    private readonly _journalRepo: IUserJournalRepository
  ) {}

  async execute({ id, userId }: { id: string; userId: string }): Promise<void> {
    const deleted = await this._journalRepo.delete(id, userId);
    if (!deleted) throw new NotFoundError("Journal entry");
  }
}
