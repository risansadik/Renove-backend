export const ROLES = {
  USER: "user",
  THERAPIST: "therapist",
  ADMIN: "admin",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const OTP_EXPIRY_MINUTES = 5;
export const OTP_TTL_SECONDS = OTP_EXPIRY_MINUTES * 60;
export const OTP_LENGTH = 6;
export const BCRYPT_ROUNDS = 12;
export const PAYMENT_EXPIRY_MINUTES = 15;
export const MS_IN_DAY = 86400000;
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
} as const;

export const THERAPIST_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
  REVIEW_REQUIRED: "review_required",
} as const;

export type TherapistStatus = (typeof THERAPIST_STATUS)[keyof typeof THERAPIST_STATUS];

export const USER_STATUS = {
  ACTIVE: "active",
  BLOCKED: "blocked",
} as const;

export type UserStatus = (typeof USER_STATUS)[keyof typeof USER_STATUS];

export const BOOKING_STATUS = {
  PENDING: "pending",
  REJECTED: "rejected",
  AWAITING_PAYMENT: "awaiting_payment",
  CONFIRMED: "confirmed",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  EXPIRED: "expired",
  NO_SHOW: "no_show",
} as const;

export type BookingStatus = (typeof BOOKING_STATUS)[keyof typeof BOOKING_STATUS];

export const PAYMENT_STATUS = {
  UNPAID: "unpaid",
  PENDING: "pending",
  PAID: "paid",
  FAILED: "failed",
  REFUNDED: "refunded",
} as const;

export type PaymentStatus = (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS];

export const REFUND_STATUS = {
  NONE: "none",
  PENDING: "pending",
  PROCESSED: "processed",
  FAILED: "failed",
  PARTIAL: "partial",
} as const;

export type RefundStatus = (typeof REFUND_STATUS)[keyof typeof REFUND_STATUS];

export const SLOT_STATUS = {
  AVAILABLE: "AVAILABLE",
  RESERVED: "RESERVED",
  BOOKED: "BOOKED",
  BLOCKED: "BLOCKED",
  EXPIRED: "EXPIRED",
} as const;

export type SlotStatus = (typeof SLOT_STATUS)[keyof typeof SLOT_STATUS];

export const REPORT_STATUS = {
  OPEN: "open",
  IN_REVIEW: "in_review",
  RESOLVED: "resolved",
  REJECTED: "rejected",
} as const;

export type ReportStatus = (typeof REPORT_STATUS)[keyof typeof REPORT_STATUS];

export const REPORT_CATEGORY = {
  TECHNICAL_ISSUE: "Technical Issue",
  PAYMENT_ISSUE: "Payment Issue",
  SESSION_ISSUE: "Session Issue",
  ACCOUNT_ISSUE: "Account Issue",
  THERAPIST_COMPLAINT: "Therapist Complaint",
  USER_COMPLAINT: "User Complaint",
  FEATURE_REQUEST: "Feature Request",
  OTHER: "Other",
} as const;

export type ReportCategory = (typeof REPORT_CATEGORY)[keyof typeof REPORT_CATEGORY];

export const HttpStatus = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  GONE: 410,
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

export const GOOGLE_CONFIG = {
  CLIENT_ID: process.env.GOOGLE_CLIENT_ID || "",
  CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || "",
} as const;

export const S3_CONFIG = {
  REGION: process.env.AWS_REGION || "us-east-1",
  ACCESS_KEY: process.env.AWS_ACCESS_KEY_ID || "",
  SECRET_KEY: process.env.AWS_SECRET_ACCESS_KEY || "",
  BUCKET_NAME: process.env.AWS_S3_BUCKET_NAME || "",
} as const;

export const MESSAGES = {
  AUTH: {
    REGISTER_SUCCESS: "Registration successful. Please verify your email.",
    VERIFY_SUCCESS: "Email verified successfully",
    OTP_RESENT: "OTP resent successfully",
    LOGIN_SUCCESS: "Login successful",
    LOGOUT_SUCCESS: "Logged out successfully",
    GOOGLE_SUCCESS: "Google authentication successful",
    FORGOT_PW_SUCCESS: "Password reset OTP sent to your email",
    RESET_PW_SUCCESS: "Password reset successful",
    TOKEN_REFRESHED: "Token refreshed successfully",
    THERAPIST_REGISTER_SUBMITTED: "Registration submitted. Please verify your email.",
    THERAPIST_VERIFY_PENDING: "Email verified. Please wait for admin approval.",
  },
  BOOKING: {
    CREATED: "Booking created",
    FETCHED: "Bookings fetched",
    UPDATED: "Booking status updated",
    CANCELLED: "Booking cancelled",
  },
  PROFILE: {
    USER_FETCHED: "User profile fetched",
    USER_UPDATED: "User profile updated",
    PW_CHANGED: "Password changed successfully",
    THERAPIST_FETCHED: "Therapist profile fetched",
    THERAPIST_UPDATE_PROCESSED: "Therapist profile update processed",
    ADMIN_FETCHED: "Admin profile fetched",
    ADMIN_UPDATED: "Admin profile updated",
    PENDING_UPDATES_FETCHED: "Pending therapist updates fetched",
  },
  DASHBOARD: {
    FETCHED: "Dashboard fetched",
    MOOD_LOGGED: "Mood logged",
    MISSION_UPDATED: "Mission updated",
    THERAPISTS_FETCHED: "Therapists fetched",
  },
  ADMIN: {
    LOGIN_SUCCESS: "Admin login successful",
    USERS_FETCHED: "Users fetched",
    USER_STATUS_UPDATED: "User status updated",
    THERAPISTS_FETCHED: "Therapists fetched",
    THERAPIST_STATUS_UPDATED: "Therapist status updated",
    FINANCE_STATS_FETCHED: "Admin finance stats fetched successfully",
    COMMISSION_UPDATED: (pct: number) => `Platform commission updated to ${pct}%`,
  },
  WALLET: {
    FETCHED: "Wallet data fetched successfully",
  },
  AVAILABILITY: {
    RULE_CREATED: "Availability rule created",
    RULES_FETCHED: "Availability rules fetched",
    SLOTS_FETCHED: "Available slots fetched",
    RULE_DELETED: "Rule and available slots deleted",
  },
  PAYMENT: {
    INTENT_CREATED: "Payment intent created successfully",
    SESSION_COMPLETED: "Session completed and funds moved",
    VERIFIED: "Payment verified",
  },
  COMMON: {
    INTERNAL_ERROR: "Internal server error",
  },
  LEVEL: {
    GENERATED: "Your personalized journey has been generated",
    FETCHED: "Levels fetched successfully",
    REGENERATED: "Your journey has been regenerated",
    ALREADY_EXISTS: "Journey already exists. Use regenerate to create a new one",
    COMPLETED: "Level completed. XP awarded.",
  },
  REPORT: {
    CREATED: "Report submitted successfully",
    FETCHED: "Reports fetched successfully",
    UPDATED: "Report status updated successfully",
    NOTES_ADDED: "Admin notes added successfully",
    NOT_FOUND: "Report not found",
  },
} as const;

export const LEVEL_DIFFICULTY = {
  EASY: "Easy",
  MEDIUM: "Medium",
  HARD: "Hard",
} as const;

export type LevelDifficulty = (typeof LEVEL_DIFFICULTY)[keyof typeof LEVEL_DIFFICULTY];

export const ADDICTION_SEVERITY = {
  MILD: "mild",
  MODERATE: "moderate",
  SEVERE: "severe",
} as const;

export type AddictionSeverity = (typeof ADDICTION_SEVERITY)[keyof typeof ADDICTION_SEVERITY];

export const CHAT_ROLE = {
  USER: "user",
  ASSISTANT: "assistant",
} as const;

export type ChatRole = (typeof CHAT_ROLE)[keyof typeof CHAT_ROLE];


export const COLLECTION_NAME = "renove_recovery_knowledge";
export const VECTOR_SIZE = 3072;
export const TOP_K = 6;

export const DOCUMENT_TTL_DAYS = 60;
export const DOCUMENT_RETENTION_DAYS = 180;
export const RELEVANCE_THRESHOLD = 0.7;

export const CALL_EVENTS = {
  CONNECTION: "connection",
  DISCONNECT: "disconnect",
  CALL_JOIN: "call:join",
  CALL_OFFER: "call:offer",
  CALL_ANSWER: "call:answer",
  ICE_CANDIDATE: "call:ice-candidate",
  CALL_LEAVE: "call:leave",
  PEER_JOINED: "call:peer-joined",
  PEER_LEFT: "call:peer-left",
  MEDIA_STATE: "call:media-state",
} as const;
