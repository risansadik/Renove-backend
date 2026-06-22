import type { IUseCase } from "../IUseCase";
import type { PaginationParams, PaginatedResult } from "../../../domain/interfaces/pagination";
import type { PublicTherapistDTO } from "../../mappers/therapist.mapper";
import type { TherapistStatus } from "../../../shared/constants/index";
import { MissionEntity, MoodLogEntity } from "../../../domain/entities/UserProgress.entity";

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
  missions: MissionEntity[];
  recentMoods: MoodLogEntity[];
  habits: IUserHabitStats[];
  weekDays: string[];
}
export type IGetUserDashboardUseCase = IUseCase<string, IUserDashboardResponse>;

export type ILogMoodUseCase = IUseCase<{ userId: string; mood: string }, void>;

export type IToggleMissionUseCase = IUseCase<{ userId: string; missionId: string }, MissionEntity[]>;

export interface IPublicTherapistCard extends PublicTherapistDTO {
  avatar: string;
}
export type IGetApprovedTherapistsUseCase = IUseCase<PaginationParams, PaginatedResult<IPublicTherapistCard>>;