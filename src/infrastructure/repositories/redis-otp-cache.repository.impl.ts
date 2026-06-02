import { injectable, inject } from "inversify";
import { Redis } from "ioredis"; // This is both the class and the TypeScript type
import { TYPES } from "../../shared/constants/tokens.ts"
import type { IOtpCacheRepository } from "../../domain/repositories/otp-cache.repository.ts";

@injectable()
export class RedisOtpCacheRepository implements IOtpCacheRepository {
  constructor(@inject(TYPES.RedisClient) private readonly _redis: Redis) {}

  async setOtp(email: string, otp: string, ttlSeconds: number): Promise<void> {
    await this._redis.set(`otp:${email}`, otp, "EX", ttlSeconds);
  }

  async getOtp(email: string): Promise<string | null> {
    return await this._redis.get(`otp:${email}`);
  }

  async deleteOtp(email: string): Promise<void> {
    await this._redis.del(`otp:${email}`);
  }
}