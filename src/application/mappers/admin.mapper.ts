import type { AdminEntity } from "../../domain/entities/Admin.entity";

export interface PublicAdminDTO {
  id: string;
  name: string;
  email: string;
  profileImage?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class AdminMapper {
  static toPublicDTO(entity: AdminEntity): PublicAdminDTO {
    return {
      id: entity.id,
      name: entity.name,
      email: entity.email,
      profileImage: entity.profileImage,
    };
  }

  static toProfileDTO(entity: AdminEntity): PublicAdminDTO {
    return {
      ...this.toPublicDTO(entity),
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
