export interface ICompleteSessionUseCase {
  execute(bookingId: string, therapistId: string): Promise<{ success: boolean; message?: string }>;
}

export interface ICreatePaymentIntentUseCase {
  execute(bookingId: string, userId: string): Promise<{ clientSecret: string | null; amount: number; consultationFee: number; commissionPercentage: number; platformFee: number }>;
}

export interface IExpirePaymentUseCase {
  execute(bookingId: string): Promise<void>;
}

export interface IHandleStripeWebhookUseCase {
  execute(signature: string, rawBody: string): Promise<void>;
}

export interface IVerifyPaymentUseCase {
  execute(sessionId: string): Promise<{ success: boolean }>;
}
