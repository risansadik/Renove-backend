import type { BaseRepository } from "./base.repository.ts";
import type { TherapistEntity } from "../entities/Therapist.entity.ts";
import type { TherapistStatus } from "../../shared/constants/index.ts";
import { PaginationParams, PaginatedResult } from "../interfaces/pagination.ts";

export interface ITherapistRepository extends BaseRepository<TherapistEntity> {
    findByEmail(email: string): Promise<TherapistEntity | null>;
    updateStatus(id: string, status: TherapistStatus): Promise<void>;
    updateOtp(email: string, otp: string, otpExpiry: Date): Promise<void>;
    verifyTherapist(email: string): Promise<void>;
    resetPassword(email: string, hashedPassword: string): Promise<void>;
    findByStatus(status: TherapistStatus, params?: PaginationParams): Promise<PaginatedResult<TherapistEntity>>;
}
