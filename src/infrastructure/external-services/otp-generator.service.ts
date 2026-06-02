import { injectable } from "inversify";
import type { IOtpGenerator } from "../../application/interfaces/services/IOtpGenerator.ts";
import { generateOtp } from "../../shared/utils/otp.ts";

@injectable()
export class OtpGenerator implements IOtpGenerator {
  generate(): string {
    return generateOtp();
  }
}
