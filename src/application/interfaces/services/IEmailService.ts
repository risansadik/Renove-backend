export interface IEmailService {
  sendOtpEmail(email: string, otp: string, name: string): Promise<void>;
  sendPasswordResetOtp(email: string, otp: string): Promise<void>;
  sendTherapistApprovalEmail(email: string, name: string): Promise<void>;
  sendTherapistRejectionEmail(email: string, name: string): Promise<void>;
}