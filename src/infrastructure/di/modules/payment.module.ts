import type { Container } from "inversify";
import {
  ICompleteSessionUseCase,
  ICreatePaymentIntentUseCase,
  IHandleStripeWebhookUseCase,
  IExpirePaymentUseCase,
  IVerifyPaymentUseCase,
} from "../../../application/interfaces/payment/IPaymentUseCase"


import {
  CreatePaymentIntentUseCase,
  CompleteSessionUseCase,
  HandleStripeWebhookUseCase,
  ExpirePaymentUseCase,
  VerifyPaymentUseCase
} from '../../../application/use-cases/payment/payment.usecase'

import { PaymentController } from "../../../presentation/controllers/payment.controller";
import { TYPES } from "../../../shared/constants/tokens";

export const registerPaymentModule = (container: Container): void => {
  container.bind<ICompleteSessionUseCase>(TYPES.CompleteSessionUseCase).to(CompleteSessionUseCase)
  container.bind<ICreatePaymentIntentUseCase>(TYPES.CreatePaymentIntentUseCase).to(CreatePaymentIntentUseCase)
  container.bind<IHandleStripeWebhookUseCase>(TYPES.HandleStripeWebhookUseCase).to(HandleStripeWebhookUseCase)
  container.bind<IExpirePaymentUseCase>(TYPES.ExpirePaymentUseCase).to(ExpirePaymentUseCase)
  container.bind<IVerifyPaymentUseCase>(TYPES.VerifyPaymentUseCase).to(VerifyPaymentUseCase)

  container.bind<PaymentController>(TYPES.PaymentController).to(PaymentController).inSingletonScope();
};
