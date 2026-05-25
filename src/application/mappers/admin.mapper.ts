import type { AdminEntity } from "../../domain/entities/Admin.entity.ts";
import type { IAdminRaw } from "../../infrastructure/databases/schema/admin.schema.ts";

export class AdminMapper {

  static toEntity(doc: IAdminRaw): AdminEntity {
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
