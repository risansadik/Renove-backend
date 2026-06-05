import { OTP_EXPIRY_MINUTES, OTP_LENGTH } from "../constants/index.js";

class OtpService {
  private readonly digits = "0123456789";

  generate(): string {
    let otp = "";
    for (let i = 0; i < OTP_LENGTH; i++) {
      otp += this.digits[Math.floor(Math.random() * 10)];
    }
    return otp;
  }

  getExpiry(minutes = OTP_EXPIRY_MINUTES): Date {
    return new Date(Date.now() + minutes * 60 * 1000);
  }

  isExpired(expiryDate: Date): boolean {
    return new Date() > expiryDate;
  }
}

export const otpService = new OtpService();