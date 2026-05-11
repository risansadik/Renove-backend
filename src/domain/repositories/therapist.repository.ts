import type { BaseRepository } from "./base.repository";
import type { TherapistEntity } from "../entities/Therapist.entity";
import type { TherapistStatus } from "../../shared/constants/index";

export interface ITherapistRepository extends BaseRepository<TherapistEntity> {
    findByEmail(email: string): Promise<TherapistEntity | null>;
    updateStatus(id: string, status: TherapistStatus): Promise<void>;
    updateOtp(email: string, otp: string, otpExpiry: Date): Promise<void>;
    verifyTherapist(email: string): Promise<void>;
    findByStatus(status: TherapistStatus): Promise<TherapistEntity[]>;
}