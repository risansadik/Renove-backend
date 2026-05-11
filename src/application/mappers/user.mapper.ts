import type { UserEntity } from "../../domain/entities/User.entity";
import type { IUserRaw } from "../../infrastructure/databases/schema/user.schema";


export class UserMapper {
  static toEntity(doc: IUserRaw): UserEntity {
    return {
      id: doc._id.toString(),
      name: doc.name,
      email: doc.email,
      password: doc.password,
      isGoogleAuth: doc.isGoogleAuth,
      isVerified: doc.isVerified,
      status: doc.status,
      otp: doc.otp,
      otpExpiry: doc.otpExpiry,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  static toPublicDTO(entity: UserEntity) {
    return {
      id: entity.id,
      name: entity.name,
      email: entity.email,
      isVerified: entity.isVerified,
      status: entity.status,
      createdAt: entity.createdAt,
    };
  }
}