import type { ITherapistRepository } from "../../domain/repositories/therapist.repository.ts";
import type { TherapistEntity } from "../../domain/entities/Therapist.entity.ts";
import type { TherapistStatus } from "../../shared/constants/index.ts";
import { TherapistModel } from "../databases/schema/therapist.schema.ts";
import { TherapistMapper } from "../../application/mappers/therapist.mapper.ts";

import { PaginationParams, PaginatedResult } from "../../domain/interfaces/pagination.ts";

export class TherapistRepository implements ITherapistRepository {
  async findById(id: string): Promise<TherapistEntity | null> {
    const doc = await TherapistModel.findById(id).lean().exec();
    return doc ? TherapistMapper.toEntity(doc) : null;
  }

  async findByEmail(email: string): Promise<TherapistEntity | null> {
    const doc = await TherapistModel.findOne({ email }).lean().exec();
    return doc ? TherapistMapper.toEntity(doc) : null;
  }

  async findAll(params?: PaginationParams): Promise<PaginatedResult<TherapistEntity>> {
    const query = TherapistModel.find();
    if (params) {
      query.skip((params.page - 1) * params.limit).limit(params.limit);
    }
    const [docs, total] = await Promise.all([
      query.lean().exec(),
      TherapistModel.countDocuments()
    ]);
    return {
      data: docs.map(TherapistMapper.toEntity),
      total
    };
  }

  async findByStatus(status: TherapistStatus, params?: PaginationParams): Promise<PaginatedResult<TherapistEntity>> {
    const query = TherapistModel.find({ status });
    if (params) {
      query.skip((params.page - 1) * params.limit).limit(params.limit);
    }
    const [docs, total] = await Promise.all([
      query.lean().exec(),
      TherapistModel.countDocuments({ status })
    ]);
    return {
      data: docs.map(TherapistMapper.toEntity),
      total
    };
  }

  async create(data: Partial<TherapistEntity>): Promise<TherapistEntity> {
    const doc = await TherapistModel.create(data);
    return TherapistMapper.toEntity(doc.toObject());
  }

  async update(id: string, data: Partial<TherapistEntity>): Promise<TherapistEntity | null> {
    const doc = await TherapistModel.findByIdAndUpdate(id, data, { new: true }).lean().exec();
    return doc ? TherapistMapper.toEntity(doc) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await TherapistModel.findByIdAndDelete(id);
    return !!result;
  }

  async updateStatus(id: string, status: TherapistStatus): Promise<void> {
    await TherapistModel.updateOne({ _id: id }, { status });
  }

  async updateOtp(email: string, otp: string, otpExpiry: Date): Promise<void> {
    await TherapistModel.updateOne({ email }, { otp, otpExpiry });
  }

  async verifyTherapist(email: string): Promise<void> {
    await TherapistModel.updateOne({ email },{$set : {isVerified : true},$unset : {otp : "",otpExpiry : ""}});
  }

  async resetPassword(email: string, hashedPassword: string): Promise<void> {
    await TherapistModel.updateOne(
      { email },
      { $set: { password: hashedPassword }, $unset: { otp: "", otpExpiry: "" } }
    );
  }
}
