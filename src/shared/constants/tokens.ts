export const TYPES = {
  // Infrastructure / Drivers
  RedisClient: Symbol.for("RedisClient"),

  // Repositories
  UserRepository: Symbol.for("IUserRepository"),
  OtpCacheRepository: Symbol.for("IOtpCacheRepository"),
  AdminRepository: Symbol.for("IAdminRepository"),
  AvailabilityRepository: Symbol.for("IAvailabilityRepository"),
  SlotRepository: Symbol.for("ISlotRepository"),
  BookingRepository: Symbol.for("IBookingRepository"),
  FinanceRepository: Symbol.for("IFinanceRepository"),
  PaymentRepository: Symbol.for("IPaymentRepository"),
  SettingsRepository: Symbol.for("ISettingsRepository"),
  TherapistRepository: Symbol.for("ITherapistRepository"),
  TherapistReviewRepository: Symbol.for("ITherapistReviewRepository"),
  UserProgressRepository: Symbol.for("IUserProgressRepository"),
  WalletRepository: Symbol.for("WalletRepository"),
  LevelRepository: Symbol.for("ILevelRepository"),
  ChatMessageRepository: Symbol.for("ChatMessageRepository"),
  ReportRepository: Symbol.for("IReportRepository"),

  // External Services
  EmailService: Symbol.for("IEmailService"),
  GoogleService: Symbol.for("IGoogleService"),
  OtpGenerator: Symbol.for("IOtpGenerator"),
  PasswordHasher: Symbol.for("IPasswordHasher"),
  TokenService: Symbol.for("ITokenService"),
  Logger: Symbol.for("ILogger"),
  SocketServer: Symbol.for("SocketServer"),
  EmbeddingService: Symbol.for("IEmbeddingService"),
  VectorStoreService: Symbol.for("IVectorStoreService"),
  SearchService: Symbol.for("ISearchService"),
  RagService: Symbol.for("IRagService"),
  ChatService: Symbol.for("IChatService"),
  LlmClient: Symbol.for("LlmClient"),
  GeminiClient: Symbol.for("GeminiClient"),
  QdrantClient: Symbol.for("QdrantClient"),
  SerperClient: Symbol.for("SerperClient"),


  // Use Cases (Auth)
  RegisterUserUseCase: Symbol.for("IRegisterUserUseCase"),
  VerifyOtpUseCase: Symbol.for("IVerifyOtpUseCase"),
  ResendOtpUseCase: Symbol.for("IResendOtpUseCase"),
  LoginUserUseCase: Symbol.for("ILoginUserUseCase"),
  GoogleAuthUseCase: Symbol.for("IGoogleAuthUseCase"),
  ForgotPasswordUseCase: Symbol.for("IForgotPasswordUseCase"),
  ResetPasswordUseCase: Symbol.for("IResetPasswordUseCase"),
  VerifyResetOtpUseCase: Symbol.for("IVerifyResetOtpUseCase"),
  RefreshTokenUseCase: Symbol.for("IRefreshTokenUseCase"),
  LoginTherapistUseCase: Symbol.for("ILoginTherapistUseCase"),
  RegisterTherapistUseCase: Symbol.for("IRegisterTherapistUseCase"),
  VerifyTherapistOtpUseCase: Symbol.for("IVerifyTherapistOtpUseCase"),
  AdminLoginUseCase: Symbol.for("IAdminLoginUseCase"),
  GenerateLevelsUseCase: Symbol.for("IGenerateLevelsUseCase"),
  GetUserLevelsUseCase: Symbol.for("IGetUserLevelsUseCase"),
  CompleteLevelUseCase: Symbol.for("ICompleteLevelUseCase"),

  // Use Cases (Admin)
  AdminFinanceUseCase: Symbol.for("IAdminFinanceUseCase"),
  AdminManagementUseCase: Symbol.for("IAdminManagementUseCase"),
  GetAllTherapistsUseCase: Symbol.for("IGetAllTherapistsUseCase"),
  GetAllUsersUseCase: Symbol.for("IGetAllUsersUseCase"),
  GetPendingTherapistUpdatesUseCase: Symbol.for("IGetPendingTherapistUpdatesUseCase"),
  ReviewTherapistProfileUseCase: Symbol.for("IReviewTherapistProfileUseCase"),
  UpdateTherapistStatusUseCase: Symbol.for("IUpdateTherapistStatusUseCase"),
  UpdateUserStatusUseCase: Symbol.for("IUpdateUserStatusUseCase"),
  UpdatePlatformSettingsUseCase: Symbol.for("IUpdatePlatformSettingsUseCase"),

  // Use Cases (Availability)
  AvailabilityOperationsUseCase: Symbol.for("IAvailabilityOperationsUseCase"),
  CreateAvailabilityUseCase: Symbol.for("ICreateAvailabilityUseCase"),
  DeleteAvailabilityRuleUseCase: Symbol.for("IDeleteAvailabilityRuleUseCase"),
  GetAvailableSlotsUseCase: Symbol.for("IGetAvailableSlotsUseCase"),
  GetTherapistRulesUseCase: Symbol.for("IGetTherapistRulesUseCase"),
  LockSlotUseCase: Symbol.for("ILockSlotUseCase"),
  UnlockSlotUseCase: Symbol.for("IUnlockSlotUseCase"),

  // Use Cases (Booking)
  CancelBookingUseCase: Symbol.for("ICancelBookingUseCase"),
  CreateBookingUseCase: Symbol.for("ICreateBookingUseCase"),
  GetBookingsUseCase: Symbol.for("IGetBookingsUseCase"),
  GetTherapistBookingsUseCase: Symbol.for("IGetTherapistBookingsUseCase"),
  GetUserBookingsUseCase: Symbol.for("IGetUserBookingsUseCase"),
  UpdateBookingStatusUseCase: Symbol.for("IUpdateBookingStatusUseCase"),

  // Use Cases (Payment)
  CompleteSessionUseCase: Symbol.for("ICompleteSessionUseCase"),
  CreatePaymentIntentUseCase: Symbol.for("ICreatePaymentIntentUseCase"),
  ExpirePaymentUseCase: Symbol.for("IExpirePaymentUseCase"),
  HandleStripeWebhookUseCase: Symbol.for("IHandleStripeWebhookUseCase"),
  VerifyPaymentUseCase: Symbol.for("IVerifyPaymentUseCase"),

  // Use Cases (Profile)
  ChangeAdminPasswordUseCase: Symbol.for("IChangeAdminPasswordUseCase"),
  ChangeTherapistPasswordUseCase: Symbol.for("IChangeTherapistPasswordUseCase"),
  ChangeUserPasswordUseCase: Symbol.for("IChangeUserPasswordUseCase"),
  GetAdminProfileUseCase: Symbol.for("IGetAdminProfileUseCase"),
  GetTherapistProfileUseCase: Symbol.for("IGetTherapistProfileUseCase"),
  GetUserProfileUseCase: Symbol.for("IGetUserProfileUseCase"),
  UpdateAdminProfileUseCase: Symbol.for("IUpdateAdminProfileUseCase"),
  UpdateTherapistProfileUseCase: Symbol.for("IUpdateTherapistProfileUseCase"),
  UpdateUserProfileUseCase: Symbol.for("IUpdateUserProfileUseCase"),

  // Use Cases (Wallet)
  GetWalletUseCase: Symbol.for("IGetWalletUseCase"),

  // Use Cases (Dashboard)
  GetApprovedTherapistsUseCase: Symbol.for("IGetApprovedTherapistsUseCase"),
  GetTherapistDashboardUseCase: Symbol.for("IGetTherapistDashboardUseCase"),
  GetUserDashboardUseCase: Symbol.for("IGetUserDashboardUseCase"),
  LogMoodUseCase: Symbol.for("ILogMoodUseCase"),
  ToggleMissionUseCase: Symbol.for("IToggleMissionUseCase"),
  GetTherapistReviewStatusUseCase: Symbol.for("IGetTherapistReviewStatusUseCase"),
  RateTherapistUseCase: Symbol.for("IRateTherapistUseCase"),

  SendMessageUseCase: Symbol.for("ISendMessageUseCase"),
  GetSessionMessagesUseCase: Symbol.for("IGetSessionMessagesUseCase"),
  GetSessionsUseCase: Symbol.for("IGetSessionUseCase"),
  CreateSessionUseCase: Symbol.for("ICreateSessionUseCase"),
  DeleteSessionUseCase: Symbol.for("IDeleteSessionUseCase"),

  // Use Cases (Report)
  CreateReportUseCase: Symbol.for("ICreateReportUseCase"),
  GetMyReportsUseCase: Symbol.for("IGetMyReportsUseCase"),
  GetReportDetailsUseCase: Symbol.for("IGetReportDetailsUseCase"),
  AdminGetAllReportsUseCase: Symbol.for("IAdminGetAllReportsUseCase"),
  AdminUpdateReportUseCase: Symbol.for("IAdminUpdateReportUseCase"),

  // Controllers
  UserAuthController: Symbol.for("UserAuthController"),
  AdminController: Symbol.for("AdminController"),
  AvailabilityController: Symbol.for("AvailabilityController"),
  BookingController: Symbol.for("BookingController"),
  PaymentController: Symbol.for("PaymentController"),
  ProfileController: Symbol.for("ProfileController"),
  TherapistAuthController: Symbol.for("TherapistAuthController"),
  TherapistDashboardController: Symbol.for("TherapistDashboardController"),
  UserDashboardController: Symbol.for("UserDashboardController"),
  TherapistReviewController: Symbol.for("TherapistReviewController"),
  WalletController: Symbol.for("WalletController"),
  LevelController: Symbol.for("LevelController"),
  ChatController: Symbol.for("ChatController"),
  ReportController: Symbol.for("ReportController"),
};
