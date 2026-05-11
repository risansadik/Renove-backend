import type { AdminEntity } from "../../domain/entities/Admin.entity.js";
import type { IAdminDocument } from "../../infrastructure/databases/schema/admin.schema.js";

export class AdminMapper {

  static toEntity(doc: IAdminDocument): AdminEntity {
    return {
      id: doc._id.toString(),
      email: doc.email,
      password: doc.password,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  static toPublicDTO(entity: AdminEntity) {
    return {
      id: entity.id,
      email: entity.email,
    };
  }
}