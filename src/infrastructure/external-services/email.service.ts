import { inject, injectable } from "inversify";
import nodemailer from "nodemailer";
import { HttpStatus, MAIL_CONFIG } from "../../shared/constants/index";
import type { IEmailService } from "../../application/interfaces/services/IEmailService";
import { AppError } from "../../shared/utils/AppError";
import { TYPES } from "../../shared/constants/tokens";
import type { ILogger } from "../../application/interfaces/services/ILoggerService";

const transporter = nodemailer.createTransport({
  host: MAIL_CONFIG.HOST,
  port: MAIL_CONFIG.PORT,
  secure: MAIL_CONFIG.PORT === 465,
  auth: {
    user: MAIL_CONFIG.USER,
    pass: MAIL_CONFIG.PASS,
  },
});

const emailLayout = (content: string) => `
  <div style="font-family: sans-serif; max-width: 480px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
    <h2 style="color: ${MAIL_CONFIG.BRAND_COLOR};">${MAIL_CONFIG.BRAND_NAME}</h2>
    ${content}
    <hr style="border: none; border-top: 1px solid #eee; margin-top: 20px;" />
    <p style="color: #999; font-size: 12px;">If you didn't request this, please ignore this email.</p>
  </div>
`;


@injectable()
export class EmailService implements IEmailService {
  constructor(
    @inject(TYPES.Logger) private readonly _logger: ILogger,
  ) { }

  private async sendMail(to: string, subject: string, html: string): Promise<void> {
    await transporter.sendMail({
      from: MAIL_CONFIG.FROM,
      to,
      subject,
      html: emailLayout(html),
    }).catch((error) => {
      this._logger.error("Email send failed:", error);
      throw new AppError("Failed to send email", HttpStatus.INTERNAL_SERVER_ERROR);
    });
  };

  public async sendOtpEmail(email: string, otp: string, name: string): Promise<void> {
    const content = `
      <p>Hi <strong>${name}</strong>,</p>
      <p>Your verification code is:</p>
      <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: ${MAIL_CONFIG.BRAND_COLOR}; margin: 24px 0;">${otp}</div>
      <p>This code expires in <strong>5 minutes</strong>. Do not share it with anyone.</p>
    `;
    await this.sendMail(email, `${MAIL_CONFIG.BRAND_NAME} - Verify Your Email`, content);
  }

  public async sendPasswordResetOtp(email: string, otp: string): Promise<void> {
    const content = `
      <h3>Password Reset</h3>
      <p>Your password reset OTP is:</p>
      <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: ${MAIL_CONFIG.BRAND_COLOR}; margin: 24px 0;">${otp}</div>
      <p>This code expires in <strong>5 minutes</strong>.</p>
    `;
    await this.sendMail(email, `${MAIL_CONFIG.BRAND_NAME} - Password Reset OTP`, content);
  }

  public async sendTherapistApprovalEmail(email: string, name: string): Promise<void> {
    const content = `
      <h3>Application Approved!</h3>
      <p>Congratulations <strong>${name}</strong>!</p>
      <p>Your therapist application has been approved. You can now log in to your dashboard.</p>
    `;
    await this.sendMail(email, `${MAIL_CONFIG.BRAND_NAME} - Application Approved`, content);
  }

  public async sendTherapistRejectionEmail(email: string, name: string): Promise<void> {
    const content = `
      <h3>Application Update</h3>
      <p>Hi <strong>${name}</strong>,</p>
      <p>Your therapist application was not approved at this time.</p>
    `;
    await this.sendMail(email, `${MAIL_CONFIG.BRAND_NAME} - Application Update`, content);
  }
}
