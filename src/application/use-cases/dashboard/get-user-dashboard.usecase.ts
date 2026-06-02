import { inject, injectable } from "inversify";
import type { IBookingRepository } from "../../../domain/repositories/booking.repository.ts";
import type { IUserProgressRepository } from "../../../domain/repositories/user-progress.repository.ts";
import { BOOKING_STATUS } from "../../../shared/constants/index.ts";
import { IGetUserDashboardUseCase, IUserDashboardResponse } from "../../interfaces/dashboard/IDashboardUseCase.ts";
import { TYPES } from "../../../shared/constants/tokens.ts";

const XP_PER_LEVEL = 500;

@injectable()
export class GetUserDashboardUseCase implements IGetUserDashboardUseCase{
  constructor(
    @inject(TYPES.UserProgressRepository) private readonly _progressRepo: IUserProgressRepository,
    @inject(TYPES.BookingRepository) private readonly _bookingRepo: IBookingRepository
  ) {}

  async execute(userId: string) : Promise<IUserDashboardResponse> {
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
