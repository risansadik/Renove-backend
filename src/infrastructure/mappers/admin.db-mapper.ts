import type { IAdminDocument } from "../databases/schema/admin.schema.ts";
import type { AdminEntity } from "../../domain/entities/Admin.entity.ts";

export class AdminDbMapper {
  static toEntity(doc: IAdminDocument): AdminEntity {
    const obj = doc.toObject({ versionKey: false }) as Record<string, unknown>;
    if (obj._id) {
      obj.id = String(obj._id);
      delete obj._id;
    }
    return obj as unknown as AdminEntity;
  }
}
