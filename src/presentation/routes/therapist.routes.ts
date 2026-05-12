import { Router } from "express";
import { therapistAuthController } from "../controllers/therapist-auth-controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  LoginTherapistSchema,
  RegisterTherapistSchema,
  ResendTherapistOtpSchema,
  VerifyTherapistOtpSchema,
} from "../../application/dto/auth/therapist.dto.js";

const router = Router();

router.post("/register", validate(RegisterTherapistSchema), therapistAuthController.register);
router.post("/verify-otp", validate(VerifyTherapistOtpSchema), therapistAuthController.verifyOtp);
router.post("/resend-otp", validate(ResendTherapistOtpSchema), therapistAuthController.resendOtp);
router.post("/login", validate(LoginTherapistSchema), therapistAuthController.login);
router.post("/logout", therapistAuthController.logout);

export default router;
