import type { Response, NextFunction } from "express";
import type { AuthRequest } from "../middlewares/auth.middleware.ts";
import { UserModel } from "../../infrastructure/databases/schema/user.schema.ts";
import { TherapistModel } from "../../infrastructure/databases/schema/therapist.schema.ts";
import { WalletModel } from "../../infrastructure/databases/schema/wallet.schema.ts";
import { BookingModel } from "../../infrastructure/databases/schema/booking.schema.ts";
import { ResponseModel } from "../../shared/utils/response-model.ts";
import { BOOKING_STATUS } from "../../shared/constants/index.ts";
import { startOfDay, endOfDay, startOfWeek, endOfWeek } from "date-fns";

export const therapistDashboardController = {
  /** GET /api/therapist/dashboard */
  getDashboard: async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const therapistId = req.user!.id;
      const today = new Date();

      // Get the therapist's profile, wallet, and session counts in parallel
      const [therapist, wallet, sessionsToday, sessionsWeek] = await Promise.all([
        TherapistModel.findById(therapistId).select("name specialization experience consultationFee status createdAt").lean(),
        WalletModel.findOne({ therapistId }).lean(),
        BookingModel.countDocuments({
          therapistId,
          status: BOOKING_STATUS.CONFIRMED,
          createdAt: { $gte: startOfDay(today), $lte: endOfDay(today) }
        }),
        BookingModel.countDocuments({
          therapistId,
          status: BOOKING_STATUS.CONFIRMED,
          createdAt: { $gte: startOfWeek(today), $lte: endOfWeek(today) }
        }),
      ]);

      if (!therapist) {
        res.status(404).json(ResponseModel.error("Therapist not found"));
        return;
      }

      const totalUsers = await UserModel.countDocuments({ status: "active" });
      const joinedDaysAgo = Math.floor((Date.now() - new Date(therapist.createdAt).getTime()) / 86400000);

      const stats = {
        therapistName: therapist.name,
        specialization: therapist.specialization,
        experience: therapist.experience,
        consultationFee: therapist.consultationFee,
        status: therapist.status,
        platformUsers: totalUsers,
        joinedDaysAgo,
        sessionsToday,
        upcomingSessionsThisWeek: sessionsWeek,
        wallet: {
          pendingBalance: wallet?.pendingBalance || 0,
          availableBalance: wallet?.availableBalance || 0,
          withdrawnBalance: wallet?.withdrawnBalance || 0,
        }
      };

      res.json(ResponseModel.success("Therapist dashboard fetched", stats));
    } catch (err) {
      next(err);
    }
  },
};
