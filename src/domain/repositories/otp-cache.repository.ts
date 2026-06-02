export interface IOtpCacheRepository {
  setOtp(email: string, otp: string, ttlSeconds: number): Promise<void>;
  getOtp(email: string): Promise<string | null>;
  deleteOtp(email: string): Promise<void>;
}