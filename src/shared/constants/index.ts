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