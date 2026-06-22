import { injectable } from "inversify";
import type { IOtpGenerator } from "../../application/interfaces/services/IOtpGenerator";
import { otpService } from "../../shared/utils/otp";

@injectable()
export class OtpGenerator implements IOtpGenerator {
  generate(): string {
    return otpService.generate();
  }
}
