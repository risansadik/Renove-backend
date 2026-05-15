import type { BaseRepository } from "./base.repository.js";
import type { TherapistEntity } from "../entities/Therapist.entity.js";
import type { TherapistStatus } from "../../shared/constants/index.js";

export interface ITherapistRepository extends BaseRepository<TherapistEntity> {
    findByEmail(email: string): Promise<TherapistEntity | null>;
    updateStatus(id: string, status: TherapistStatus): Promise<void>;
    updateOtp(email: string, otp: string, otpExpiry: Date): Promise<void>;
    verifyTherapist(email: string): Promise<void>;
    resetPassword(email: string, hashedPassword: string): Promise<void>;
    findByStatus(status: TherapistStatus): Promise<TherapistEntity[]>;
}
