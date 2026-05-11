import type { TherapistEntity } from "../../domain/entities/Therapist.entity.js";
import type { ITherapistDocument } from "../../infrastructure/databases/schema/therapist.schema.js";

export class TherapistMapper {

  static toEntity(doc: ITherapistDocument): TherapistEntity {
    return {
      id: doc._id.toString(),
      name: doc.name,
      email: doc.email,
      password: doc.password,
      phone: doc.phone,
      gender: doc.gender,
      qualification: doc.qualification,
      specialization: doc.specialization,
      experience: doc.experience,
      consultationFee: doc.consultationFee,
      bio: doc.bio,
      certifications: doc.certifications,
      profileImage: doc.profileImage,
      status: doc.status,
      isVerified: doc.isVerified,
      otp: doc.otp,
      otpExpiry: doc.otpExpiry,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  static toPublicDTO(entity: TherapistEntity) {
    return {
      id: entity.id,
      name: entity.name,
      email: entity.email,
      phone: entity.phone,
      gender: entity.gender,
      qualification: entity.qualification,
      specialization: entity.specialization,
      experience: entity.experience,
      consultationFee: entity.consultationFee,
      bio: entity.bio,
      certifications: entity.certifications,
      profileImage: entity.profileImage,
      status: entity.status,
      isVerified: entity.isVerified,
      createdAt: entity.createdAt,
    };
  }
}