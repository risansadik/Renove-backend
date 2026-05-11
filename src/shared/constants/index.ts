export const ROLES = {
  USER: "user",
  THERAPIST: "therapist",
  ADMIN: "admin",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const OTP_EXPIRY_MINUTES = 10;
export const OTP_LENGTH = 6;
export const BCRYPT_ROUNDS = 12;

export const THERAPIST_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
} as const;

export type TherapistStatus = (typeof THERAPIST_STATUS)[keyof typeof THERAPIST_STATUS];

export const USER_STATUS = {
  ACTIVE: "active",
  BLOCKED: "blocked",
} as const;

export type UserStatus = (typeof USER_STATUS)[keyof typeof USER_STATUS];

export const HttpStatus = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;


export const AUTH_CONFIG = {
  ACCESS_TOKEN: {
    SECRET: process.env.JWT_ACCESS_SECRET || "default_access_secret",
    EXPIRY: (process.env.JWT_ACCESS_EXPIRES_IN as string) || "15m",
    MAX_AGE: 15 * 60 * 1000, 
  },
  REFRESH_TOKEN: {
    SECRET: process.env.JWT_REFRESH_SECRET || "default_refresh_secret",
    EXPIRY: (process.env.JWT_REFRESH_EXPIRES_IN as string) || "7d",
    MAX_AGE: 7 * 24 * 60 * 60 * 1000,
  },
} as const;

export const MAIL_CONFIG = {
  BRAND_NAME: "reNove",
  BRAND_COLOR: "#6c47ff",
  FROM: process.env.SMTP_FROM,
  HOST: process.env.SMTP_HOST,
  PORT: Number(process.env.SMTP_PORT) || 587,
  USER: process.env.SMTP_USER,
  PASS: process.env.SMTP_PASS,
} as const;