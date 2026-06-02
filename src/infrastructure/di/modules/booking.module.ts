import type { Container } from "inversify";
import type {
  ICancelBookingUseCase,
  ICreateBookingUseCase,
  IGetTherapistBookingsUseCase,
  IGetUserBookingsUseCase,
  IUpdateBookingStatusUseCase,
} from "../../../application/interfaces/booking/IBookingUseCase.ts";

import {
  CancelBookingUseCase,
  CreateBookingUseCase,
  GetTherapistBookingsUseCase,
  GetUserBookingsUseCase,
  UpdateBookingStatusUseCase,

} from '../../../application/use-cases/booking/booking.usecase.ts'

import { BookingController } from "../../../presentation/controllers/booking.controller.ts";
import { TYPES } from "../../../shared/constants/tokens.ts";

export const registerBookingModule = (container: Container): void => {
  container.bind<ICancelBookingUseCase>(TYPES.CancelBookingUseCase).to(CancelBookingUseCase)
  container.bind<ICreateBookingUseCase>(TYPES.CreateBookingUseCase).to(CreateBookingUseCase)
  container.bind<IGetTherapistBookingsUseCase>(TYPES.GetTherapistBookingsUseCase).to(GetTherapistBookingsUseCase)
  container.bind<IGetUserBookingsUseCase>(TYPES.GetUserBookingsUseCase).to(GetUserBookingsUseCase)
  container.bind<IUpdateBookingStatusUseCase>(TYPES.UpdateBookingStatusUseCase).to(UpdateBookingStatusUseCase)

  container.bind<BookingController>(TYPES.BookingController).to(BookingController).inSingletonScope();
};
