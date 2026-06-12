import type { IUseCase } from "../IUseCase.ts";
import type { PublicUserDTO } from "../../mappers/user.mapper.ts";
import type { PublicTherapistDTO } from "../../mappers/therapist.mapper.ts";
import type { UpdateUserStatusDTO, UpdateTherapistStatusDTO } from "../../dto/auth/admin.dto.ts";
import type { PaginationParams, PaginatedResult } from "../../../domain/interfaces/pagination.ts";
import { AdminFinanceStats } from "../../../domain/repositories/finance.repository.ts";
import { THERAPIST_STATUS } from "../../../shared/constants/index.ts";

export type IGetAllUsersUseCase = IUseCase<PaginationParams, PaginatedResult<PublicUserDTO>>;

export type IGetAllTherapistsUseCase = IUseCase<PaginationParams, PaginatedResult<PublicTherapistDTO>>;

export type IUpdateUserStatusUseCase = IUseCase<{ id: string; dto: UpdateUserStatusDTO }, { id: string; status: string }>;

export type IUpdateTherapistStatusUseCase = IUseCase<{ id: string; dto: UpdateTherapistStatusDTO }, { id: string; status: string }>;

export interface IFinanceStatsResponse extends AdminFinanceStats {
  commissionPercentage: number;
}

export type IGetAdminFinanceStatsUseCase = IUseCase<PaginationParams, IFinanceStatsResponse>;

export type IUpdatePlatformSettingsUseCase = IUseCase<number, { success: boolean; message: string }>;

export interface IAdminDashboardResponse {
  kpis: {
    totalUsers: number;
    totalTherapists: number;
    totalSessions: number;
    todaysSessions: number;
    activeSessions: number;
    totalRevenue: number;
    monthlyRevenue: number;
    pendingProfileReviews: number;
  };
  sessionsTrend: { label: string; date: string; booked: number; completed: number }[];
  revenueTrend: { label: string; revenue: number }[];
  sessionStatusDistribution: { completed: number; upcoming: number; cancelled: number; missed: number };
  pendingActions: {
    profileApprovals: number;
    userReports: number;
    refundRequests: number;
    verificationRequests: number;
    unresolvedSupportIssues: number;
  };
  recentActivity: { id: string; type: string; message: string; createdAt: Date }[];
  therapistPerformance: {
    therapistId: string;
    name: string;
    completedSessions: number;
    averageRating: number;
    totalRatings: number;
    retentionRate: number;
  }[];
  growthSummary: {
    newUsersThisMonth: number;
    newTherapistsThisMonth: number;
    userGrowthPercent: number;
    therapistGrowthPercent: number;
  };
  financialSummary: {
    totalRevenue: number;
    monthlyRevenue: number;
    pendingTherapistPayouts: number;
    completedPayouts: number;
    successfulTransactionCount: number;
  };
  systemHealth: { label: string; status: "operational" | "degraded" | "offline" }[];
}

export type IGetAdminDashboardUseCase = IUseCase<void, IAdminDashboardResponse>;

export type IGetPendingTherapistUpdatesUseCase = IUseCase<void, PublicTherapistDTO[]>;

export interface IReviewTherapistInput {
  therapistId: string;
  status: typeof THERAPIST_STATUS.APPROVED | typeof THERAPIST_STATUS.REJECTED;
  reason?: string;
}

export type IReviewTherapistProfileUseCase = IUseCase<IReviewTherapistInput, PublicTherapistDTO | null>;
