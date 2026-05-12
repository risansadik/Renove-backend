import type { IUserRepository } from "../../domain/repositories/user.repository";
import type { UserEntity } from "../../domain/entities/User.entity";
import { UserModel } from "../databases/schema/user.schema";
import { UserMapper } from "../../application/mappers/user.mapper";

export class UserRepository implements IUserRepository {
  async findById(id: string): Promise<UserEntity | null> {
    const doc = await UserModel.findById(id).lean().exec();
    return doc ? UserMapper.toEntity(doc) : null;
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const doc = await UserModel.findOne({ email }).lean().exec();
    return doc ? UserMapper.toEntity(doc) : null;
  }

  async findAll(): Promise<UserEntity[]> {
    const docs = await UserModel.find().lean().exec();
    return docs.map(UserMapper.toEntity);
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
