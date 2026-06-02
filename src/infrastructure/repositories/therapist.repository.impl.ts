import { injectable } from "inversify";

import { BaseRepository } from "./base-repository.impl.ts";

import type { ITherapistRepository } from "../../domain/repositories/therapist.repository.ts";
import type { TherapistEntity } from "../../domain/entities/Therapist.entity.ts";
import type { TherapistStatus } from "../../shared/constants/index.ts";
import { PAGINATION } from "../../shared/constants/index.ts";

import { TherapistModel } from "../databases/schema/therapist.schema.ts";
import type { ITherapistDocument } from "../databases/schema/therapist.schema.ts";

import type {
  NestedPaginatedResult,
  PaginationParams,
  PaginatedResult,
} from "../../domain/interfaces/pagination.ts";

@injectable()
export class TherapistRepository
  extends BaseRepository<TherapistEntity, ITherapistDocument>
  implements ITherapistRepository
{
  constructor() {
    super(TherapistModel);
  }

  public async findByEmail(
    email: string
  ): Promise<TherapistEntity | null> {
    const document = await this.model.findOne({ email }).exec();

    return document ? this.toEntity(document) : null;
  }

  public override async findAll(params?: PaginationParams): Promise<NestedPaginatedResult<TherapistEntity>> {
    const page = Math.max(1, params?.page ?? PAGINATION.DEFAULT_PAGE);
    const limit = Math.max(1, params?.limit ?? PAGINATION.DEFAULT_LIMIT);
    const skip = (page - 1) * limit;
    const search = params?.search?.trim();
    const filter = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
            { qualification: { $regex: search, $options: "i" } },
            { specialization: { $regex: search, $options: "i" } },
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

  public async findByStatus(
    status: TherapistStatus,
    params?: PaginationParams
  ): Promise<PaginatedResult<TherapistEntity>> {
    const page = Math.max(1, params?.page ?? PAGINATION.DEFAULT_PAGE);
    const limit = Math.max(1, params?.limit ?? PAGINATION.DEFAULT_LIMIT);
    const skip = (page - 1) * limit;

    const search = params?.search?.trim();
    const filter = {
      status,
      ...(search
        ? {
            $or: [
              { name: { $regex: search, $options: "i" } },
              { email: { $regex: search, $options: "i" } },
              { qualification: { $regex: search, $options: "i" } },
              { specialization: { $regex: search, $options: "i" } },
            ],
          }
        : {}),
    };

    const [documents, total] = await Promise.all([
      this.model
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),

      this.model.countDocuments(filter).exec(),
    ]);

    return {
      data: documents.map((doc) => this.toEntity(doc)),
      total,
    };
  }

  public async updateStatus(
    id: string,
    status: TherapistStatus
  ): Promise<void> {
    await this.model.updateOne(
      { _id: id },
      {
        $set: { status },
      }
    );
  }

  public async verifyTherapist(
    email: string
  ): Promise<void> {
    await this.model.updateOne(
      { email },
      {
        $set: {
          isVerified: true,
        },
      }
    );
  }

  public async resetPassword(
    email: string,
    hashedPassword: string
  ): Promise<void> {
    await this.model.updateOne(
      { email },
      {
        $set: {
          password: hashedPassword,
        },
      }
    );
  }
}
