import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/**
 * Creates a resilient Redis client that doesn't crash if environment variables are missing.
 * Instead, it returns a null/noop proxy that prevents the application (especially Middleware)
 * from crashing due to DNS resolution errors like placeholder.upstash.io.
 */
function createSafeRedisClient(url?: string, token?: string): Redis {
  // Use real client if valid credentials are present
  if (url && token && url !== "placeholder") {
    return new Redis({ url, token });
  }

  // Fallback: Return a fake object with placeholder properties to avoid
  // library initialization from crashing.
  const mockClient = {
    url: "http://127.0.0.1:0",
    token: "placeholder",
    // Standard Redis methods expected by most of our code
    get: async () => null,
    set: async () => null,
    del: async () => null,
    hget: async () => null,
    hset: async () => null,
    incr: async () => 0,
    expire: async () => null,
    ratelimit: async () => null,
    // Add bit of safety for auto-pipeline/exec used in some parts
    pipeline: () => ({
      get: () => {},
      set: () => {},
      exec: async () => [],
    }),
  };

  return new Proxy(mockClient as any, {
    get(target, prop) {
      if (prop in target) {
        return (target as any)[prop];
      }
      // For any missing method, return a silent Async function
      return async () => null;
    },
  });
}

export const redis = createSafeRedisClient(
  process.env.UPSTASH_REDIS_REST_URL,
  process.env.UPSTASH_REDIS_REST_TOKEN,
);

export const lockerRedisClient = createSafeRedisClient(
  process.env.UPSTASH_REDIS_REST_LOCKER_URL,
  process.env.UPSTASH_REDIS_REST_LOCKER_TOKEN,
);

// Create a new ratelimiter, that allows 10 requests per 10 seconds by default
export const ratelimit = (
  requests: number = 10,
  seconds:
    | `${number} ms`
    | `${number} s`
    | `${number} m`
    | `${number} h`
    | `${number} d` = "10 s",
) => {
  return new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(requests, seconds),
    analytics: true,
    prefix: "papermark",
  });
};
