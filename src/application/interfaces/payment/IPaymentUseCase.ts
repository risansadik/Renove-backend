import type { IUseCase } from "../IUseCase.ts";


export interface ICreatePaymentIntentInput {
  bookingId: string;
  userId: string;
}

export interface ICompleteSessionInput {
  bookingId: string;
  therapistId: string;
}


export interface IHandleStripeWebhookInput {
  signature: string;
  rawBody: string;
}


export type ICreatePaymentIntentUseCase = IUseCase<
  ICreatePaymentIntentInput, 
  { clientSecret: string | null; amount: number; consultationFee: number; commissionPercentage: number; platformFee: number }
>;

export type ICompleteSessionUseCase = IUseCase<
  ICompleteSessionInput, 
  { success: boolean; message?: string }
>;

export interface IVerifyPaymentInput {
  bookingId: string;
  userId: string;
}



export type IExpirePaymentUseCase = IUseCase<void, void>;

export type IVerifyPaymentUseCase = IUseCase<IVerifyPaymentInput, { success?: boolean ; alreadyProccesed ?: boolean}>;

export type IHandleStripeWebhookUseCase = IUseCase<IHandleStripeWebhookInput, void>;