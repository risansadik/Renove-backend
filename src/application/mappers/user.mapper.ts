import type { UserEntity } from "../../domain/entities/User.entity.ts";
import type { UserStatus } from "../../shared/constants/index.ts";

export interface PublicUserDTO {
  id: string;
  name: string;
  email: string;
  isVerified: boolean;
  status: UserStatus;
  isGoogleAuth?: boolean;
  profileImage?: string;
  createdAt: Date;
  updatedAt?: Date;
}

export class UserMapper {
  static toPublicDTO(entity: UserEntity): PublicUserDTO {
    return {
      id: entity.id,
      name: entity.name,
      email: entity.email,
      isVerified: entity.isVerified,
      status: entity.status,
      isGoogleAuth: entity.isGoogleAuth,
      profileImage: entity.profileImage,
      createdAt: entity.createdAt,
    };
  }

  static toPublicDTOList(entities: UserEntity[]): PublicUserDTO[] {
    return entities.map(e => this.toPublicDTO(e));
  }

  static toProfileDTO(entity: UserEntity): PublicUserDTO {
    return {
      ...this.toPublicDTO(entity),
      updatedAt: entity.updatedAt,
    };
  }
}
