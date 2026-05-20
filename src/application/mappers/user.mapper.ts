import type { UserEntity } from "../../domain/entities/User.entity.js";
import type { IUserRaw } from "../../infrastructure/databases/schema/user.schema.js";
import type { UserStatus } from "../../shared/constants/index.js";

export interface PublicUserDTO {
  id: string;
  name: string;
  email: string;
  isVerified: boolean;
  status: UserStatus;
  isGoogleAuth?: boolean;
  createdAt: Date;
}

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

  static toPublicDTO(entity: UserEntity): PublicUserDTO {
    return {
      id: entity.id,
      name: entity.name,
      email: entity.email,
      isVerified: entity.isVerified,
      status: entity.status,
      isGoogleAuth: entity.isGoogleAuth,
      createdAt: entity.createdAt,
    };
  }

  static toPublicDTOList(entities: UserEntity[]): PublicUserDTO[] {
    return entities.map(e => this.toPublicDTO(e));
  }
}
