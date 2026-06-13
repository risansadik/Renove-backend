import { injectable } from "inversify";
import { BaseRepository } from "./base-repository.impl.ts";
import type { ILevelRepository } from "../../domain/repositories/level.repository.ts";
import type { LevelEntity } from "../../domain/entities/Level.entity.ts";
import { LevelModel, type ILevelDocument } from "../databases/schema/level.schema.ts";
import { LevelDbMapper } from "../mappers/level.db-mapper.ts";

@injectable()
export class LevelRepository
  extends BaseRepository<LevelEntity, ILevelDocument>
  implements ILevelRepository
{
  constructor() {
    super(LevelModel);
  }

  protected override toEntity(doc: ILevelDocument): LevelEntity {
    return LevelDbMapper.toEntity(doc);
  }

  public override async findById(id: string): Promise<LevelEntity | null> {
    try {
      const doc = await this.model.findOne({ _id: id }).exec();
      return doc ? this.toEntity(doc) : null;
    } catch {
      return null;
    }
  }

  public override async update(
    id: string,
    data: Partial<LevelEntity>
  ): Promise<LevelEntity | null> {
    try {
      const doc = await this.model
        .findOneAndUpdate(
          { _id: id },
          { $set: data as Record<string, unknown> },
          { new: true }
        )
        .exec();
      return doc ? this.toEntity(doc) : null;
    } catch {
      return null;
    }
  }

  public async findByUserId(userId: string): Promise<LevelEntity[]> {
    const docs = await this.model
      .find({ userId })
      .sort({ level: 1 })
      .exec();
    return docs.map((d) => this.toEntity(d));
  }

  public async findActiveByUserId(userId: string): Promise<LevelEntity | null> {
    const doc = await this.model
      .findOne({ userId, isCompleted: false })
      .sort({ level: 1 })
      .exec();
    return doc ? this.toEntity(doc) : null;
  }

  public async deleteAllByUserId(userId: string): Promise<void> {
    await this.model.deleteMany({ userId }).exec();
  }

  public async countByUserId(userId: string): Promise<number> {
    return this.model.countDocuments({ userId }).exec();
  }
}