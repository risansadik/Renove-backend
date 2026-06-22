import type { IUserDocument } from "../databases/schema/user.schema";
import type { UserEntity } from "../../domain/entities/User.entity";

export class UserDbMapper {
  static toEntity(doc: IUserDocument): UserEntity {
    const obj = doc.toObject({ versionKey: false }) as Record<string, unknown>;
    if (obj._id) {
      obj.id = String(obj._id);
      delete obj._id;
    }
    return obj as unknown as UserEntity;
  }
}
