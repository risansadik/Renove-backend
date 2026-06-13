import type { TherapistEntity } from "../../domain/entities/Therapist.entity.ts";
import type { TherapistStatus } from "../../shared/constants/index.ts";

export interface PublicTherapistDTO {
  id: string;
  name: string;
  email: string;
  gender: string;
  qualification: string;
  specialization: string[];
  experience: number;
  consultationFee: number;
  bio: string;
  certifications?: string[];
  certificationFiles?: string[];
  profileImage?: string;
  status: TherapistStatus;
  isVerified: boolean;
  pendingUpdates?: TherapistEntity["pendingUpdates"];
  adminRejectionReason?: string;
  createdAt: Date;
  updatedAt?: Date;
}

export class TherapistMapper {
  static toPublicDTO(entity: TherapistEntity): PublicTherapistDTO {
    const rawName = entity.name || "";
    const formattedName = rawName.startsWith("Dr. ") ? rawName : `Dr. ${rawName}`;
    return {
      id: entity.id,
      name: formattedName,
      email: entity.email,
      gender: entity.gender,
      qualification: entity.qualification,
      specialization: entity.specialization,
      experience: entity.experience,
      consultationFee: entity.consultationFee,
      bio: entity.bio,
      certifications: entity.certifications,
      certificationFiles: entity.certificationFiles,
      profileImage: entity.profileImage,
      status: entity.status,
      isVerified: entity.isVerified,
      createdAt: entity.createdAt,
    };
  }

  static toPublicDTOList(entities: TherapistEntity[]): PublicTherapistDTO[] {
    return entities.map(e => this.toPublicDTO(e));
  }

  static toProfileDTO(entity: TherapistEntity): PublicTherapistDTO {
    return {
      ...this.toPublicDTO(entity),
      name: entity.name,
      pendingUpdates: entity.pendingUpdates,
      adminRejectionReason: entity.adminRejectionReason,
      updatedAt: entity.updatedAt,
    };
  }

  static toProfileDTOList(entities: TherapistEntity[]): PublicTherapistDTO[] {
    return entities.map(e => this.toProfileDTO(e));
  }
}
