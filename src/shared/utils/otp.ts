import { OTP_EXPIRY_MINUTES, OTP_LENGTH } from "../constants/index";

export const generateOtp = (): string => {
  const digits = "0123456789";
  let otp = "";
  for (let i = 0; i < OTP_LENGTH; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }
  return otp;
};

export const getOtpExpiry = (minutes = OTP_EXPIRY_MINUTES): Date => {
  return new Date(Date.now() + minutes * 60 * 1000);
};

export const isOtpExpired = (expiryDate: Date): boolean => {
  return new Date() > expiryDate;
};