import type { BaseRepository } from "./base.repository.ts";
import type { TherapistEntity } from "../entities/Therapist.entity.ts";
import type { TherapistStatus } from "../../shared/constants/index.ts";
import type { PaginationParams, PaginatedResult } from "../interfaces/pagination.ts";

export interface ITherapistRepository extends BaseRepository<TherapistEntity> {
  findByEmail(email: string): Promise<TherapistEntity | null>;

  updateStatus(
    id: string,
    status: TherapistStatus
  ): Promise<void>;

  verifyTherapist(email: string): Promise<void>;

  resetPassword(
    email: string,
    hashedPassword: string
  ): Promise<void>;

  findByStatus(
    status: TherapistStatus,
    params?: PaginationParams
  ): Promise<PaginatedResult<TherapistEntity>>;

  updateRatingSummary(
    id: string,
    summary: { averageRating: number; totalRatings: number }
  ): Promise<TherapistEntity | null>;

  countAll(): Promise<number>;
  countByStatuses(statuses: TherapistStatus[]): Promise<number>;
  countCreatedAfter(date: Date): Promise<number>;
  countCreatedBetween(start: Date, end: Date): Promise<number>;
  findRecent(limit: number): Promise<TherapistEntity[]>;
}
