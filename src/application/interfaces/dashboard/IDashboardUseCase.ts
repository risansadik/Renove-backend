import type { IUseCase } from "../IUseCase.ts";
import type { PaginationParams, PaginatedResult } from "../../../domain/interfaces/pagination.ts";
import type { PublicTherapistDTO } from "../../mappers/therapist.mapper.ts";
import type { TherapistStatus } from "../../../shared/constants/index.ts";

export interface ITherapistDashboardResponse {
  therapistName: string;
  specialization: string[];
  experience: number;
  consultationFee: number;
  status: TherapistStatus;
  platformUsers: number;
  joinedDaysAgo: number;
  sessionsToday: number;
  upcomingSessionsThisWeek: number;
  averageRating: number;
  totalRatings: number;
  wallet: {
    pendingBalance: number;
    availableBalance: number;
    withdrawnBalance: number;
  };
}
export type IGetTherapistDashboardUseCase = IUseCase<string, ITherapistDashboardResponse>;

export interface IUserHabitStats {
  label: string;
  color: string;
  streak: number;
  done: boolean[];
}

export interface IUserDashboardResponse {
  xp: number;
  level: number;
  xpPercent: number;
  streakDays: number;
  totalSessionsDone: number;
  pendingPayments: number;
  missions: any[];
  recentMoods: any[];
  habits: IUserHabitStats[];
  weekDays: string[];
}
export type IGetUserDashboardUseCase = IUseCase<string, IUserDashboardResponse>;

export type ILogMoodUseCase = IUseCase<{ userId: string; mood: string }, void>;

export type IToggleMissionUseCase = IUseCase<{ userId: string; missionId: string }, any>;

export interface IPublicTherapistCard extends PublicTherapistDTO {
  avatar: string;
}
export type IGetApprovedTherapistsUseCase = IUseCase<PaginationParams, PaginatedResult<IPublicTherapistCard>>;