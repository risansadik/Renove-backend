import { Model, Document } from "mongoose";
import { BaseRepository as IBaseRepository } from "../../domain/repositories/base.repository";
import { PaginationParams, NestedPaginatedResult } from "../../domain/interfaces/pagination";
import { PAGINATION } from "../../shared/constants/index";

export abstract class BaseRepository<T extends { id: string }, D extends Document> implements IBaseRepository<T> {
  constructor(protected readonly model: Model<D>) {}

  protected abstract toEntity(doc: D): T;

  public async findById(id: string): Promise<T | null> {
    const document = await this.model.findById(id).exec();
    return document ? this.toEntity(document) : null;
  }

  public async findAll(params?: PaginationParams): Promise<NestedPaginatedResult<T>> {
    const page = Math.max(1, params?.page ?? PAGINATION.DEFAULT_PAGE);
    const limit = Math.max(1, params?.limit ?? PAGINATION.DEFAULT_LIMIT);
    const skip = (page - 1) * limit;

    const [documents, total] = await Promise.all([
      this.model.find().skip(skip).limit(limit).sort({ createdAt: -1 }).exec(),
      this.model.countDocuments().exec()
    ]);

    return {
      data: documents.map((doc) => this.toEntity(doc)),
      total,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  public async create(data: Partial<T>): Promise<T> {
    const createdDocument = await this.model.create(data as Record<string, unknown>);
    return this.toEntity(createdDocument);
  }

  public async update(id: string, data: Partial<T>): Promise<T | null> {
  const setFields: Record<string, unknown> = {};
  const unsetFields: Record<string, ""> = {};

  for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
    if (value === undefined) {
      unsetFields[key] = "";
    } else {
      setFields[key] = value;
    }
  }

  const updateQuery: Record<string, unknown> = {};
  if (Object.keys(setFields).length > 0) updateQuery.$set = setFields;
  if (Object.keys(unsetFields).length > 0) updateQuery.$unset = unsetFields;

  const updatedDocument = await this.model
    .findByIdAndUpdate(id, updateQuery, { new: true })
    .exec();
  return updatedDocument ? this.toEntity(updatedDocument) : null;
}

  public async delete(id: string): Promise<boolean> {
    const result = await this.model.findByIdAndDelete(id).exec();
    return result !== null;
  }
}