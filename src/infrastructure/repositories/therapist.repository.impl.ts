import type { ITherapistRepository } from "../../domain/repositories/therapist.repository.js";
import type { TherapistEntity } from "../../domain/entities/Therapist.entity.js";
import type { TherapistStatus } from "../../shared/constants/index.js";
import { TherapistModel } from "../databases/schema/therapist.schema.js";
import { TherapistMapper } from "../../application/mappers/therapist.mapper.js";

export class TherapistRepository implements ITherapistRepository {
  async findById(id: string): Promise<TherapistEntity | null> {
    const doc = await TherapistModel.findById(id).lean().exec();
    return doc ? TherapistMapper.toEntity(doc) : null;
  }

  async findByEmail(email: string): Promise<TherapistEntity | null> {
    const doc = await TherapistModel.findOne({ email }).lean().exec();
    return doc ? TherapistMapper.toEntity(doc) : null;
  }

  async findAll(): Promise<TherapistEntity[]> {
    const docs = await TherapistModel.find().lean().exec();
    return docs.map(TherapistMapper.toEntity);
  }

  async findByStatus(status: TherapistStatus): Promise<TherapistEntity[]> {
    const docs = await TherapistModel.find({ status }).lean().exec();
    return docs.map(TherapistMapper.toEntity);
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
