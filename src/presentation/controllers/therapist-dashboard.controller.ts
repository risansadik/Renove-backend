import type { Response, NextFunction } from "express";
import type { AuthRequest } from "../middlewares/auth.middleware.js";
import { UserModel } from "../../infrastructure/databases/schema/user.schema.js";
import { TherapistModel } from "../../infrastructure/databases/schema/therapist.schema.js";
import { ResponseModel } from "../../shared/utils/response-model.js";

export const therapistDashboardController = {
  /** GET /api/therapist/dashboard */
  getDashboard: async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const therapistId = req.user!.id;

      // Get the therapist's own profile
      const therapist = await TherapistModel.findById(therapistId)
        .select("name specialization experience consultationFee status createdAt")
        .lean()
        .exec();

      if (!therapist) {
        res.status(404).json(ResponseModel.error("Therapist not found"));
        return;
      }

      // Count total active (approved) users in the platform as "potential clients"
      const totalUsers = await UserModel.countDocuments({ status: "active" });

      // Days since therapist joined (simulate tenure)
      const joinedDaysAgo = Math.floor(
        (Date.now() - new Date(therapist.createdAt).getTime()) / 86400000
      );

      // Simulated stats based on real data we have
      // (Session tracking would require a Booking schema — out of scope here,
      //  so we derive meaningful real numbers from existing data)
      const stats = {
        therapistName: therapist.name,
        specialization: therapist.specialization,
        experience: therapist.experience,
        consultationFee: therapist.consultationFee,
        status: therapist.status,
        platformUsers: totalUsers,
        joinedDaysAgo,
        // These would come from a Booking model when implemented:
        sessionsToday: 0,
        upcomingSessionsThisWeek: 0,
      };

      res.json(ResponseModel.success("Therapist dashboard fetched", stats));
    } catch (err) {
      next(err);
    }
  },
};
