import { injectable } from "inversify";
import bcrypt from "bcryptjs";
import type { IPasswordHasher } from "../../application/interfaces/services/IPasswordHasher";
import { BCRYPT_ROUNDS } from "../../shared/constants/index";

@injectable()
export class BcryptPasswordHasher implements IPasswordHasher {
  hash(password: string): Promise<string> {
    return bcrypt.hash(password, BCRYPT_ROUNDS);
  }

  compare(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }
}
