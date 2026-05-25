import type { IUserRepository } from "../../domain/repositories/user.repository.ts";
import type { UserEntity } from "../../domain/entities/User.entity.ts";
import { UserModel } from "../databases/schema/user.schema.ts";
import { UserMapper } from "../../application/mappers/user.mapper.ts";

import { PaginationParams, PaginatedResult } from "../../domain/interfaces/pagination.ts";

export class UserRepository implements IUserRepository {
  async findById(id: string): Promise<UserEntity | null> {
    const doc = await UserModel.findById(id).lean().exec();
    return doc ? UserMapper.toEntity(doc) : null;
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const doc = await UserModel.findOne({ email }).lean().exec();
    return doc ? UserMapper.toEntity(doc) : null;
  }

  async findAll(params?: PaginationParams): Promise<PaginatedResult<UserEntity>> {
    const query = UserModel.find();
    if (params) {
      query.skip((params.page - 1) * params.limit).limit(params.limit);
    }
    const [docs, total] = await Promise.all([
      query.lean().exec(),
      UserModel.countDocuments()
    ]);
    return {
      data: docs.map(UserMapper.toEntity),
      total
    };
  }

  async create(data: Partial<UserEntity>): Promise<UserEntity> {
    const doc = await UserModel.create(data);
    return UserMapper.toEntity(doc.toObject());
  }

  async update(id: string, data: Partial<UserEntity>): Promise<UserEntity | null> {
    const doc = await UserModel.findByIdAndUpdate(id, data, { new: true }).lean().exec();
    return doc ? UserMapper.toEntity(doc) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await UserModel.findByIdAndDelete(id);
    return !!result;
  }

  async updateOtp(email: string, otp: string, otpExpiry: Date): Promise<void> {
    await UserModel.updateOne({ email }, { otp, otpExpiry });
  }

  async verifyUser(email: string): Promise<void> {
    await UserModel.updateOne(
      { email },
      { $set: { isVerified: true }, $unset: { otp: "", otpExpiry: "" } }
    );
  }

  async updateStatus(id: string, status: UserEntity["status"]): Promise<void> {
    await UserModel.updateOne({ _id: id }, { status });
  }
}
