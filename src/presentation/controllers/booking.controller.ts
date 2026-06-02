import type { Request, Response } from "express";
import { injectable, inject } from "inversify";
import type {
  ICancelBookingUseCase,
  ICreateBookingUseCase,
  IGetTherapistBookingsUseCase,
  IGetUserBookingsUseCase,
  IUpdateBookingStatusUseCase,
} from "../../application/interfaces/booking/IBookingUseCase.ts";
import { BookingMapper } from "../../application/mappers/booking.mapper.ts";
import { HttpStatus, PAGINATION, MESSAGES } from "../../shared/constants/index.ts";
import { TYPES } from "../../shared/constants/tokens.ts";
import type { AuthenticatedRequest } from "../../shared/types/express.ts";
import { NotFoundError } from "../../shared/utils/AppError.ts";
import { ResponseModel } from "../../shared/utils/response-model.ts";

@injectable()
export class BookingController {
  constructor(
    @inject(TYPES.CreateBookingUseCase) private readonly _createBookingUseCase: ICreateBookingUseCase,
    @inject(TYPES.GetUserBookingsUseCase) private readonly _getUserBookingsUseCase: IGetUserBookingsUseCase,
    @inject(TYPES.GetTherapistBookingsUseCase) private readonly _getTherapistBookingsUseCase: IGetTherapistBookingsUseCase,
    @inject(TYPES.UpdateBookingStatusUseCase) private readonly _updateStatusUseCase: IUpdateBookingStatusUseCase,
    @inject(TYPES.CancelBookingUseCase) private readonly _cancelBookingUseCase: ICancelBookingUseCase
  ) {}

  public createBooking = async (req: Request, res: Response): Promise<void> => {
    const userId = (req as AuthenticatedRequest).user.id;
    const booking = await this._createBookingUseCase.execute({ userId, data: req.body });
    res.status(HttpStatus.CREATED).json(ResponseModel.created(MESSAGES.BOOKING.CREATED, BookingMapper.toPublicDTO(booking)));
  };

  public getUserBookings = async (req: Request, res: Response): Promise<void> => {
    const userId = (req as AuthenticatedRequest).user.id;
    const page = parseInt(req.query.page as string) || PAGINATION.DEFAULT_PAGE;
    const limit = parseInt(req.query.limit as string) || PAGINATION.DEFAULT_LIMIT;

    const bookings = await this._getUserBookingsUseCase.execute({ userId, params: { page, limit } });
    const totalPages = Math.ceil(bookings.total / limit);

    res.json(ResponseModel.success(MESSAGES.BOOKING.FETCHED, BookingMapper.toPublicDTOList(bookings.data), HttpStatus.OK, {
      total: bookings.total,
      page,
      limit,
      totalPages
    }));
  };

  public getTherapistBookings = async (req: Request, res: Response): Promise<void> => {
    const therapistId = (req as AuthenticatedRequest).user.id;
    const page = parseInt(req.query.page as string) || PAGINATION.DEFAULT_PAGE;
    const limit = parseInt(req.query.limit as string) || PAGINATION.DEFAULT_LIMIT;

    const bookings = await this._getTherapistBookingsUseCase.execute({ therapistId, params: { page, limit } });
    const totalPages = Math.ceil(bookings.total / limit);

    res.json(ResponseModel.success(MESSAGES.BOOKING.FETCHED, BookingMapper.toPublicDTOList(bookings.data), HttpStatus.OK, {
      total: bookings.total,
      page,
      limit,
      totalPages
    }));
  };

  public updateStatus = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { status, rejectionReason } = req.body;
    const booking = await this._updateStatusUseCase.execute({ id, status, rejectionReason });
    
    if (!booking) {
      throw new NotFoundError("Booking");
    }

    res.json(ResponseModel.success(MESSAGES.BOOKING.UPDATED, BookingMapper.toPublicDTO(booking)));
  };

  public cancelBooking = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { reason } = req.body;
    const user = (req as AuthenticatedRequest).user;
    
    const cancelledBy = user.role === "therapist" ? "therapist" : "user";
    
    const booking = await this._cancelBookingUseCase.execute({
      bookingId: id,
      cancelledBy,
      userIdOrTherapistId: user.id,
      reason: reason || "No reason provided"
    });

    res.json(ResponseModel.success(MESSAGES.BOOKING.CANCELLED, BookingMapper.toPublicDTO(booking)));
  };
}
