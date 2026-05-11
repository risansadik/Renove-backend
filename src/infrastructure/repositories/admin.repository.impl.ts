import type { IAdminRepository } from "../../domain/repositories/admin.repository.js";
import type { AdminEntity } from "../../domain/entities/Admin.entity.js";
import { AdminModel } from "../databases/schema/admin.schema.js";
import { AdminMapper } from "../../application/mappers/admin.mapper.js";

export class AdminRepository implements IAdminRepository {
  async findById(id: string): Promise<AdminEntity | null> {
    const doc = await AdminModel.findById(id).lean();
    return doc ? AdminMapper.toEntity(doc) : null;
  }

  async findByEmail(email: string): Promise<AdminEntity | null> {
    const doc = await AdminModel.findOne({ email }).lean();
    return doc ? AdminMapper.toEntity(doc) : null;
  }

  async findAll(): Promise<AdminEntity[]> {
    const docs = await AdminModel.find().lean();
    return docs.map(AdminMapper.toEntity);
  }

  async create(data: Partial<AdminEntity>): Promise<AdminEntity> {
    const doc = await AdminModel.create(data);
    return AdminMapper.toEntity(doc.toObject());
  }

  async update(id: string, data: Partial<AdminEntity>): Promise<AdminEntity | null> {
    const doc = await AdminModel.findByIdAndUpdate(id, data, { new: true }).lean();
    return doc ? AdminMapper.toEntity(doc) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await AdminModel.findByIdAndDelete(id);
    return !!result;
  }
}