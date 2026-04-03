import { Receiver } from "@upstash/qstash";
import { Client } from "@upstash/qstash";
import Bottleneck from "bottleneck";

// we're using Bottleneck to avoid running into Resend's rate limit of 10 req/s
export const limiter = new Bottleneck({
  maxConcurrent: 1, // maximum concurrent requests
  minTime: 100, // minimum time between requests in ms
});

/**
 * Creates a resilient QStash client that doesn't crash on initialization when env vars are missing.
 */
function createQStashClient(token?: string): Client {
  if (token && token !== "placeholder") {
    return new Client({ token });
  }

  // Return a mock if not configured
  return new Proxy({} as Client, {
    get(_, prop) {
      return () => {
        // We log a warning instead of a hard crash in some contexts
        console.warn("QStash is not configured. Some features may not work.");
        return Promise.resolve(null);
      };
    },
  });
}

// we're using Upstash's Receiver to verify the request signature
export const receiver = new Receiver({
  currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY || "",
  nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY || "",
});

export const qstash = createQStashClient(process.env.QSTASH_TOKEN);
