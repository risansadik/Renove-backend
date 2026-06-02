import { Redis } from "ioredis";

let redisClient: Redis | null = null;

const REDIS_DEFAULTS = {
  MAX_RETRIES: 3,
  RETRY_DELAY_FACTOR: 50,
  MAX_RETRY_DELAY: 2000,
};

export const initRedis = (): Redis => {
  if (!redisClient) {
    const redisUrl = process.env.REDIS_URL || "redis://127.0.0.1:6379";
    
    redisClient = new Redis(redisUrl, {
      maxRetriesPerRequest: REDIS_DEFAULTS.MAX_RETRIES,
      retryStrategy(times) {
        const delay = Math.min(times * REDIS_DEFAULTS.RETRY_DELAY_FACTOR, REDIS_DEFAULTS.MAX_RETRY_DELAY);
        return delay;
      },
    });

    redisClient.on("connect", () => {
      console.log("Redis connected successfully");
    });

    redisClient.on("error", (err) => {
      console.error("Redis connection error:", err);
    });
  }

  return redisClient;
};

export { redisClient };