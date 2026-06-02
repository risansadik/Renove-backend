import { endOfDay, endOfWeek, startOfDay, startOfWeek } from "date-fns";
import type { IBookingRepository } from "../../../domain/repositories/booking.repository.ts";
import type { ITherapistRepository } from "../../../domain/repositories/therapist.repository.ts";
import type { IUserRepository } from "../../../domain/repositories/user.repository.ts";
import type { IWalletRepository } from "../../../domain/repositories/wallet.repository.ts";
import { BOOKING_STATUS, USER_STATUS } from "../../../shared/constants/index.ts";
import { NotFoundError } from "../../../shared/utils/AppError.ts";
import { IGetTherapistDashboardUseCase } from "../../interfaces/dashboard/IDashboardUseCase.ts";
import { injectable, inject } from "inversify";
import { TYPES } from "../../../shared/constants/tokens.ts";

@injectable()
export class GetTherapistDashboardUseCase implements IGetTherapistDashboardUseCase{
  constructor(
    @inject(TYPES.TherapistRepository) private readonly _therapistRepo: ITherapistRepository,
    @inject(TYPES.WalletRepository) private readonly _walletRepo: IWalletRepository,
    @inject(TYPES.BookingRepository) private readonly _bookingRepo: IBookingRepository,
    @inject(TYPES.UserRepository) private readonly _userRepo: IUserRepository
  ) {}

  async execute(therapistId: string) {
    const today = new Date();
    const [therapist, wallet, sessionsToday, sessionsWeek, totalUsers] = await Promise.all([
      this._therapistRepo.findById(therapistId),
      this._walletRepo.findByTherapistId(therapistId),
      this._bookingRepo.countByTherapistAndStatusBetween(therapistId, BOOKING_STATUS.CONFIRMED, startOfDay(today), endOfDay(today)),
      this._bookingRepo.countByTherapistAndStatusBetween(therapistId, BOOKING_STATUS.CONFIRMED, startOfWeek(today), endOfWeek(today)),
      this._userRepo.countByStatus(USER_STATUS.ACTIVE),
    ]);

    if (!therapist) {
      throw new NotFoundError("Therapist");
    }

    return {
      therapistName: therapist.name,
      specialization: therapist.specialization,
      experience: therapist.experience,
      consultationFee: therapist.consultationFee,
      status: therapist.status,
      platformUsers: totalUsers,
      joinedDaysAgo: Math.floor((Date.now() - new Date(therapist.createdAt).getTime()) / 86400000),
      sessionsToday,
      upcomingSessionsThisWeek: sessionsWeek,
      wallet: {
        pendingBalance: wallet?.pendingBalance ?? 0,
        availableBalance: wallet?.availableBalance ?? 0,
        withdrawnBalance: wallet?.withdrawnBalance ?? 0,
      },
    };
  }
}
