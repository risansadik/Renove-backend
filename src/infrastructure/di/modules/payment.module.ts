import type { Container } from "inversify";
import { CompleteSessionUseCase } from "../../../application/use-cases/payment/complete-session.usecase.ts";
import { CreatePaymentIntentUseCase } from "../../../application/use-cases/payment/create-payment-intent.usecase.ts";
import { ExpirePaymentUseCase } from "../../../application/use-cases/payment/expire-payment.usecase.ts";
import { HandleStripeWebhookUseCase } from "../../../application/use-cases/payment/handle-stripe-webhook.usecase.ts";
import { VerifyPaymentUseCase } from "../../../application/use-cases/payment/verify-payment.usecase.ts";
import type { ISlotRepository } from "../../../domain/repositories/availability.repository.ts";
import type { IBookingRepository } from "../../../domain/repositories/booking.repository.ts";
import type { IPaymentRepository } from "../../../domain/repositories/payment.repository.ts";
import type { ISettingsRepository } from "../../../domain/repositories/settings.repository.ts";
import type { ITherapistRepository } from "../../../domain/repositories/therapist.repository.ts";
import type { IWalletRepository } from "../../../domain/repositories/wallet.repository.ts";
import { PaymentController } from "../../../presentation/controllers/payment.controller.ts";
import { TYPES } from "../../../shared/constants/tokens.ts";

export const registerPaymentModule = (container: Container): void => {
  container.bind<CompleteSessionUseCase>(TYPES.CompleteSessionUseCase).toDynamicValue((context) =>
    new CompleteSessionUseCase(
      context.get<IBookingRepository>(TYPES.BookingRepository),
      context.get<IWalletRepository>(TYPES.WalletRepository),
      context.get<IPaymentRepository>(TYPES.PaymentRepository)
    )
  );
  container.bind<CreatePaymentIntentUseCase>(TYPES.CreatePaymentIntentUseCase).toDynamicValue((context) =>
    new CreatePaymentIntentUseCase(
      context.get<IPaymentRepository>(TYPES.PaymentRepository),
      context.get<IBookingRepository>(TYPES.BookingRepository),
      context.get<ITherapistRepository>(TYPES.TherapistRepository),
      context.get<ISettingsRepository>(TYPES.SettingsRepository)
    )
  );
  container.bind<HandleStripeWebhookUseCase>(TYPES.HandleStripeWebhookUseCase).toDynamicValue((context) =>
    new HandleStripeWebhookUseCase(
      context.get<IPaymentRepository>(TYPES.PaymentRepository),
      context.get<IBookingRepository>(TYPES.BookingRepository),
      context.get<IWalletRepository>(TYPES.WalletRepository),
      context.get<ISlotRepository>(TYPES.SlotRepository)
    )
  );
  container.bind<ExpirePaymentUseCase>(TYPES.ExpirePaymentUseCase).toDynamicValue((context) =>
    new ExpirePaymentUseCase(
      context.get<IBookingRepository>(TYPES.BookingRepository),
      context.get<ISlotRepository>(TYPES.SlotRepository),
      context.get<IPaymentRepository>(TYPES.PaymentRepository)
    )
  );
  container.bind<VerifyPaymentUseCase>(TYPES.VerifyPaymentUseCase).toDynamicValue((context) =>
    new VerifyPaymentUseCase(
      context.get<IPaymentRepository>(TYPES.PaymentRepository),
      context.get<IBookingRepository>(TYPES.BookingRepository),
      context.get<IWalletRepository>(TYPES.WalletRepository),
      context.get<ISlotRepository>(TYPES.SlotRepository)
    )
  );

  container.bind<PaymentController>(TYPES.PaymentController).to(PaymentController).inSingletonScope();
};
