import { subDays, startOfDay, endOfDay, startOfMonth, subMonths, format } from "date-fns";
import { inject, injectable } from "inversify";
import { TYPES } from "../../../shared/constants/tokens";
import { BOOKING_STATUS, REPORT_STATUS, THERAPIST_STATUS } from "../../../shared/constants/index";
import type { IGetAdminDashboardUseCase, IAdminDashboardResponse } from "../../interfaces/admin/IAdminUseCase";
import type { IUserRepository } from "../../../domain/repositories/user.repository";
import type { ITherapistRepository } from "../../../domain/repositories/therapist.repository";
import type { IBookingRepository } from "../../../domain/repositories/booking.repository";
import type { IReportRepository } from "../../../domain/repositories/report.repository";
import type { IWalletRepository } from "../../../domain/repositories/wallet.repository";

const roundMoney = (value: number) => Number(value.toFixed(2));

@injectable()
export class GetAdminDashboardUseCase implements IGetAdminDashboardUseCase {
  constructor(
    @inject(TYPES.UserRepository) private readonly _userRepo: IUserRepository,
    @inject(TYPES.TherapistRepository) private readonly _therapistRepo: ITherapistRepository,
    @inject(TYPES.BookingRepository) private readonly _bookingRepo: IBookingRepository,
    @inject(TYPES.ReportRepository) private readonly _reportRepo: IReportRepository,
    @inject(TYPES.WalletRepository) private readonly _walletRepo: IWalletRepository
  ) {}

  async execute(): Promise<IAdminDashboardResponse> {
    const now = new Date();
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);
    const monthStart = startOfMonth(now);
    const previousMonthStart = startOfMonth(subMonths(now, 1));

    const [
      totalUsers,
      totalTherapists,
      totalSessions,
      todaysSessions,
      activeSessions,
      pendingProfileReviews,
      pendingReports,
      usersThisMonth,
      usersPreviousMonth,
      therapistsThisMonth,
      therapistsPreviousMonth,
      transactions,
      wallets,
      topTherapistsRaw,
      recentBookings,
      recentUsers,
      recentTherapists,
      recentReports,
    ] = await Promise.all([
      this._userRepo.countAll(),
      this._therapistRepo.countAll(),
      this._bookingRepo.countAll(),
      this._bookingRepo.countBySlotStartTimeBetween(todayStart, todayEnd),
      this._bookingRepo.countByStatuses([BOOKING_STATUS.CONFIRMED, BOOKING_STATUS.AWAITING_PAYMENT]),
      this._therapistRepo.countByStatuses([THERAPIST_STATUS.PENDING, THERAPIST_STATUS.REVIEW_REQUIRED]),
      this._reportRepo.countByStatuses([REPORT_STATUS.OPEN, REPORT_STATUS.IN_REVIEW]),
      this._userRepo.countCreatedAfter(monthStart),
      this._userRepo.countCreatedBetween(previousMonthStart, monthStart),
      this._therapistRepo.countCreatedAfter(monthStart),
      this._therapistRepo.countCreatedBetween(previousMonthStart, monthStart),
      this._walletRepo.findRecentTransactions(50),
      this._walletRepo.findAllTherapistWallets(),
      this._bookingRepo.getTopTherapists(5),
      this._bookingRepo.findRecentBookings(8),
      this._userRepo.findRecent(5),
      this._therapistRepo.findRecent(5),
      this._reportRepo.findRecent(5),
    ]);

    const totalRevenue = roundMoney(transactions.reduce((sum, tx) => sum + (tx.platformFee ?? 0), 0));
    const monthlyRevenue = roundMoney(
      transactions
        .filter((tx) => tx.createdAt && tx.createdAt >= monthStart)
        .reduce((sum, tx) => sum + (tx.platformFee ?? 0), 0)
    );
    const pendingPayouts = roundMoney(wallets.reduce((sum, wallet) => sum + (wallet.pendingBalance ?? 0), 0));
    const completedPayouts = roundMoney(wallets.reduce((sum, wallet) => sum + (wallet.withdrawnBalance ?? 0), 0));
    const successfulTransactions = transactions.filter((tx) => tx.status === "completed").length;

    const sessionsTrend = Array.from({ length: 30 }, (_, index) => {
      const day = subDays(now, 29 - index);
      return {
        label: format(day, "MMM d"),
        booked: 0,
        completed: 0,
        date: format(day, "yyyy-MM-dd"),
      };
    });

    const trendBookings = await this._bookingRepo.findBookingsCreatedAfter(subDays(now, 29));

    trendBookings.forEach((booking) => {
      if (!booking.createdAt) return;
      const date = format(booking.createdAt, "yyyy-MM-dd");
      const bucket = sessionsTrend.find((point) => point.date === date);
      if (!bucket) return;
      bucket.booked += 1;
      if (booking.status === BOOKING_STATUS.COMPLETED) bucket.completed += 1;
    });

    const revenueTrend = Array.from({ length: 6 }, (_, index) => {
      const date = subMonths(now, 5 - index);
      const monthKey = format(date, "yyyy-MM");
      return {
        label: format(date, "MMM"),
        revenue: roundMoney(
          transactions
            .filter((tx) => tx.createdAt && format(tx.createdAt, "yyyy-MM") === monthKey)
            .reduce((sum, tx) => sum + (tx.platformFee ?? 0), 0)
        ),
      };
    });

    const statusDistribution = await this._bookingRepo.getStatusDistribution();

    const getStatusCount = (statuses: string[]) =>
      statusDistribution
        .filter((item) => statuses.includes(item.status))
        .reduce((sum, item) => sum + item.count, 0);

    const recentActivity = [
      ...recentUsers.map((user) => ({ id: `user-${user.id}`, type: "user", message: `New user registered: ${user.name}`, createdAt: user.createdAt })),
      ...recentTherapists.map((therapist) => ({ id: `therapist-${therapist.id}`, type: "therapist", message: `Therapist application: ${therapist.name}`, createdAt: therapist.createdAt })),
      ...recentReports.map((report) => ({ id: `report-${report.id}`, type: "report", message: `Report submitted: ${report.category}`, createdAt: report.createdAt })),
      ...recentBookings.map((booking) => {
        const user = booking.userId as unknown as { name?: string };
        const therapist = booking.therapistId as unknown as { name?: string };
        return {
          id: `booking-${booking.id}`,
          type: "session",
          message: `Session ${booking.status}: ${user?.name ?? "Client"} with ${therapist?.name ?? "Therapist"}`,
          createdAt: booking.updatedAt ?? booking.createdAt ?? new Date(),
        };
      }),
      ...transactions.slice(0, 8).map((tx) => ({ id: `tx-${tx.id}`, type: "payment", message: tx.description, createdAt: tx.createdAt ?? new Date() })),
    ]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 12);

    return {
      kpis: {
        totalUsers,
        totalTherapists,
        totalSessions,
        todaysSessions,
        activeSessions,
        totalRevenue,
        monthlyRevenue,
        pendingProfileReviews,
      },
      sessionsTrend,
      revenueTrend,
      sessionStatusDistribution: {
        completed: getStatusCount([BOOKING_STATUS.COMPLETED]),
        upcoming: getStatusCount([BOOKING_STATUS.PENDING, BOOKING_STATUS.AWAITING_PAYMENT, BOOKING_STATUS.CONFIRMED]),
        cancelled: getStatusCount([BOOKING_STATUS.CANCELLED, BOOKING_STATUS.REJECTED, BOOKING_STATUS.EXPIRED]),
        missed: getStatusCount([BOOKING_STATUS.NO_SHOW]),
      },
      pendingActions: {
        profileApprovals: pendingProfileReviews,
        userReports: pendingReports,
        refundRequests: 0,
        verificationRequests: pendingProfileReviews,
        unresolvedSupportIssues: pendingReports,
      },
      recentActivity,
      therapistPerformance: topTherapistsRaw.map((item) => ({
        therapistId: item.therapistId,
        name: item.name,
        completedSessions: item.completedSessions,
        averageRating: item.averageRating,
        totalRatings: item.totalRatings,
        retentionRate: 0,
      })),
      growthSummary: {
        newUsersThisMonth: usersThisMonth,
        newTherapistsThisMonth: therapistsThisMonth,
        userGrowthPercent: usersPreviousMonth > 0 ? Math.round(((usersThisMonth - usersPreviousMonth) / usersPreviousMonth) * 100) : usersThisMonth > 0 ? 100 : 0,
        therapistGrowthPercent: therapistsPreviousMonth > 0 ? Math.round(((therapistsThisMonth - therapistsPreviousMonth) / therapistsPreviousMonth) * 100) : therapistsThisMonth > 0 ? 100 : 0,
      },
      financialSummary: {
        totalRevenue,
        monthlyRevenue,
        pendingTherapistPayouts: pendingPayouts,
        completedPayouts,
        successfulTransactionCount: successfulTransactions,
      },
      systemHealth: [
        { label: "Database", status: "operational" },
        { label: "Payment Gateway", status: "operational" },
        { label: "Video Consultation", status: "operational" },
        { label: "Email Service", status: "operational" },
        { label: "Notifications", status: "operational" },
        { label: "Realtime Server", status: "operational" },
      ],
    };
  }
}
