import type { Response, NextFunction } from "express";
import type { AuthRequest } from "../middlewares/auth.middleware.ts";
import { UserProgressRepository } from "../../infrastructure/repositories/user-progress.repository.impl.ts";
import { TherapistModel } from "../../infrastructure/databases/schema/therapist.schema.ts";
import { BookingModel } from "../../infrastructure/databases/schema/booking.schema.ts";
import { ResponseModel } from "../../shared/utils/response-model.ts";
import { BOOKING_STATUS } from "../../shared/constants/index.ts";

const progressRepo = new UserProgressRepository();

const XP_PER_LEVEL = 500;

export const userDashboardController = {
  /** GET /api/user/dashboard */
  getDashboard: async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const [progress, totalSessionsDone, pendingPayments] = await Promise.all([
        progressRepo.getDashboard(userId),
        BookingModel.countDocuments({ userId, status: BOOKING_STATUS.COMPLETED }),
        BookingModel.countDocuments({ userId, status: BOOKING_STATUS.AWAITING_PAYMENT }),
      ]);

      const xpInCurrentLevel = progress.xp % XP_PER_LEVEL;
      const xpPercent = Math.round((xpInCurrentLevel / XP_PER_LEVEL) * 100);

      // Get last 7 mood logs
      const recentMoods = progress.moodLogs.slice(-7);

      // Build last-7-day habit data
      const today = new Date();
      const last7: string[] = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        last7.push(d.toISOString().split("T")[0]);
      }

      const habitsWithWeek = progress.habits.map((h) => ({
        label: h.label,
        color: h.color,
        streak: h.days.filter((d) => d.done).length,
        done: last7.map((date) => h.days.find((d) => d.date === date)?.done ?? false),
      }));

      res.json(
        ResponseModel.success("Dashboard fetched", {
          xp: progress.xp,
          level: progress.level,
          xpPercent,
          streakDays: progress.streakDays,
          totalSessionsDone: totalSessionsDone ?? progress.totalSessionsDone,
          pendingPayments,
          missions: progress.missions,
          recentMoods,
          habits: habitsWithWeek,
          weekDays: last7,
        })
      );
    } catch (err) {
      next(err);
    }
  },

  /** POST /api/user/mood  body: { mood } */
  logMood: async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { mood } = req.body;
      await progressRepo.logMood(req.user!.id, mood);
      res.json(ResponseModel.success("Mood logged", null));
    } catch (err) {
      next(err);
    }
  },

  /** PATCH /api/user/missions/:missionId */
  toggleMission: async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const missions = await progressRepo.toggleMission(req.user!.id, req.params.missionId);
      res.json(ResponseModel.success("Mission updated", { missions }));
    } catch (err) {
      next(err);
    }
  },

  /** GET /api/user/therapists — approved therapists */
  getApprovedTherapists: async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      const [therapists, total] = await Promise.all([
        TherapistModel.find({ status: "approved" })
          .select("name email specialization experience consultationFee bio profileImage")
          .skip(skip)
          .limit(limit)
          .lean()
          .exec(),
        TherapistModel.countDocuments({ status: "approved" })
      ]);

      const mapped = therapists.map((t) => ({
        id: String(t._id),
        name: t.name,
        specialization: t.specialization,
        experience: t.experience,
        consultationFee: t.consultationFee,
        bio: t.bio,
        profileImage: t.profileImage,
        avatar: t.name.charAt(0).toUpperCase(),
      }));

      const totalPages = Math.ceil(total / limit);
      res.json(ResponseModel.success("Therapists fetched", mapped, 200, {
        total,
        page,
        limit,
        totalPages
      }));
    } catch (err) {
      next(err);
    }
  },
};
