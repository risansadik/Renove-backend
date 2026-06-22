import { injectable } from "inversify";

import type { IUserRepository } from "../../domain/repositories/user.repository";
import type { UserEntity } from "../../domain/entities/User.entity";
import type { UserStatus } from "../../shared/constants/index";
import type { NestedPaginatedResult, PaginationParams } from "../../domain/interfaces/pagination";
import { PAGINATION } from "../../shared/constants/index";

import { BaseRepository } from "./base-repository.impl";

import { UserModel } from "../databases/schema/user.schema";
import type { IUserDocument } from "../databases/schema/user.schema";
import { UserDbMapper } from "../mappers/user.db-mapper";

@injectable()
export class UserRepository
  extends BaseRepository<UserEntity, IUserDocument>
  implements IUserRepository {
  constructor() {
    super(UserModel);
  }

  protected toEntity(doc: IUserDocument): UserEntity {
    return UserDbMapper.toEntity(doc);
  }

  public async findByEmail(email: string): Promise<UserEntity | null> {
    const document = await this.model.findOne({ email }).exec();

    return document ? this.toEntity(document) : null;
  }

  public override async findAll(params?: PaginationParams): Promise<NestedPaginatedResult<UserEntity>> {
    const page = Math.max(1, params?.page ?? PAGINATION.DEFAULT_PAGE);
    const limit = Math.max(1, params?.limit ?? PAGINATION.DEFAULT_LIMIT);
    const skip = (page - 1) * limit;
    const search = params?.search?.trim();
    const filter = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const [documents, total] = await Promise.all([
      this.model.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }).exec(),
      this.model.countDocuments(filter).exec(),
    ]);

    return {
      data: documents.map((doc) => this.toEntity(doc)),
      total,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  public async verifyUser(email: string): Promise<void> {
    await this.model.updateOne(
      { email },
      {
        $set: {
          isVerified: true,
        },
      }
    );
  }

  public async updateStatus(
    id: string,
    status: UserEntity["status"]
  ): Promise<void> {
    await this.model.updateOne(
      { _id: id },
      {
        $set: {
          status,
        },
      }
    );
  }

  public async countByStatus(status: UserStatus): Promise<number> {
    return this.model.countDocuments({ status }).exec();
  }

  public async countAll(): Promise<number> {
    return this.model.countDocuments({}).exec();
  }

  public async countCreatedAfter(date: Date): Promise<number> {
    return this.model.countDocuments({ createdAt: { $gte: date } }).exec();
  }

  public async countCreatedBetween(start: Date, end: Date): Promise<number> {
    return this.model.countDocuments({ createdAt: { $gte: start, $lt: end } }).exec();
  }

  public async findRecent(limit: number): Promise<UserEntity[]> {
    const docs = await this.model.find({}).sort({ createdAt: -1 }).limit(limit).exec();
    return docs.map((doc) => this.toEntity(doc));
  }
}
