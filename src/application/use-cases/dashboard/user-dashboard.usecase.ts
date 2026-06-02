import type { IBookingRepository } from "../../../domain/repositories/booking.repository.ts";
import type { ITherapistRepository } from "../../../domain/repositories/therapist.repository.ts";
import type { IUserProgressRepository } from "../../../domain/repositories/user-progress.repository.ts";
import type { PaginationParams } from "../../../domain/interfaces/pagination.ts";
import { TherapistMapper } from "../../mappers/therapist.mapper.ts";
import { BOOKING_STATUS, THERAPIST_STATUS } from "../../../shared/constants/index.ts";

const XP_PER_LEVEL = 500;

export class GetUserDashboardUseCase {
  constructor(
    private readonly _progressRepo: IUserProgressRepository,
    private readonly _bookingRepo: IBookingRepository
  ) {}

  async execute(userId: string) {
    const [progress, totalSessionsDone, pendingPayments] = await Promise.all([
      this._progressRepo.getDashboard(userId),
      this._bookingRepo.countByUserAndStatus(userId, BOOKING_STATUS.COMPLETED),
      this._bookingRepo.countByUserAndStatus(userId, BOOKING_STATUS.AWAITING_PAYMENT),
    ]);

    const xpInCurrentLevel = progress.xp % XP_PER_LEVEL;
    const xpPercent = Math.round((xpInCurrentLevel / XP_PER_LEVEL) * 100);
    const recentMoods = progress.moodLogs.slice(-7);
    const today = new Date();
    const weekDays: string[] = [];

    for (let i = 6; i >= 0; i--) {
      const day = new Date(today);
      day.setDate(day.getDate() - i);
      weekDays.push(day.toISOString().split("T")[0]);
    }

    const habits = progress.habits.map((habit) => ({
      label: habit.label,
      color: habit.color,
      streak: habit.days.filter((day) => day.done).length,
      done: weekDays.map((date) => habit.days.find((day) => day.date === date)?.done ?? false),
    }));

    return {
      xp: progress.xp,
      level: progress.level,
      xpPercent,
      streakDays: progress.streakDays,
      totalSessionsDone,
      pendingPayments,
      missions: progress.missions,
      recentMoods,
      habits,
      weekDays,
    };
  }
}

export class LogMoodUseCase {
  constructor(private readonly _progressRepo: IUserProgressRepository) {}

  async execute(userId: string, mood: string): Promise<void> {
    await this._progressRepo.logMood(userId, mood);
  }
}

export class ToggleMissionUseCase {
  constructor(private readonly _progressRepo: IUserProgressRepository) {}

  async execute(userId: string, missionId: string) {
    return this._progressRepo.toggleMission(userId, missionId);
  }
}

export class GetApprovedTherapistsUseCase {
  constructor(private readonly _therapistRepo: ITherapistRepository) {}

  async execute(params: PaginationParams) {
    const result = await this._therapistRepo.findByStatus(THERAPIST_STATUS.APPROVED, params);

    return {
      data: result.data.map((therapist) => ({
        ...TherapistMapper.toPublicDTO(therapist),
        avatar: therapist.name.charAt(0).toUpperCase(),
      })),
      total: result.total,
    };
  }
}
