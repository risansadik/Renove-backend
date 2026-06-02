import type { Container } from "inversify";
import type {
  ICancelBookingUseCase,
  ICreateBookingUseCase,
  IGetTherapistBookingsUseCase,
  IGetUserBookingsUseCase,
  IUpdateBookingStatusUseCase,
} from "../../../application/interfaces/booking/IBookingUseCase.ts";
import { CancelBookingUseCase } from "../../../application/use-cases/booking/cancel-booking.usecase.ts";
import { CreateBookingUseCase } from "../../../application/use-cases/booking/create-booking.usecase.ts";
import { GetTherapistBookingsUseCase, GetUserBookingsUseCase, UpdateBookingStatusUseCase } from "../../../application/use-cases/booking/get-bookings.usecase.ts";
import type { ISlotRepository } from "../../../domain/repositories/availability.repository.ts";
import type { IBookingRepository } from "../../../domain/repositories/booking.repository.ts";
import type { IPaymentRepository } from "../../../domain/repositories/payment.repository.ts";
import type { IWalletRepository } from "../../../domain/repositories/wallet.repository.ts";
import { BookingController } from "../../../presentation/controllers/booking.controller.ts";
import { TYPES } from "../../../shared/constants/tokens.ts";

export const registerBookingModule = (container: Container): void => {
  container.bind<ICancelBookingUseCase>(TYPES.CancelBookingUseCase).toDynamicValue((context) =>
    new CancelBookingUseCase(
      context.get<IBookingRepository>(TYPES.BookingRepository),
      context.get<ISlotRepository>(TYPES.SlotRepository),
      context.get<IWalletRepository>(TYPES.WalletRepository),
      context.get<IPaymentRepository>(TYPES.PaymentRepository)
    )
  );
  container.bind<ICreateBookingUseCase>(TYPES.CreateBookingUseCase).toDynamicValue((context) =>
    new CreateBookingUseCase(
      context.get<IBookingRepository>(TYPES.BookingRepository),
      context.get<ISlotRepository>(TYPES.SlotRepository)
    )
  );
  container.bind<IGetTherapistBookingsUseCase>(TYPES.GetTherapistBookingsUseCase).toDynamicValue((context) =>
    new GetTherapistBookingsUseCase(context.get<IBookingRepository>(TYPES.BookingRepository))
  );
  container.bind<IGetUserBookingsUseCase>(TYPES.GetUserBookingsUseCase).toDynamicValue((context) =>
    new GetUserBookingsUseCase(context.get<IBookingRepository>(TYPES.BookingRepository))
  );
  container.bind<IUpdateBookingStatusUseCase>(TYPES.UpdateBookingStatusUseCase).toDynamicValue((context) =>
    new UpdateBookingStatusUseCase(
      context.get<IBookingRepository>(TYPES.BookingRepository),
      context.get<IWalletRepository>(TYPES.WalletRepository),
      context.get<IPaymentRepository>(TYPES.PaymentRepository)
    )
  );

  container.bind<BookingController>(TYPES.BookingController).to(BookingController).inSingletonScope();
};
