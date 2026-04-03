import { Receiver } from "@upstash/qstash";
import { Client } from "@upstash/qstash";
import Bottleneck from "bottleneck";

// we're using Bottleneck to avoid running into Resend's rate limit of 10 req/s
export const limiter = new Bottleneck({
  maxConcurrent: 1, // maximum concurrent requests
  minTime: 100, // minimum time between requests in ms
});

/**
 * Creates a resilient QStash client.
 */
function createQStashClient(token?: string): Client {
  if (token && token !== "placeholder" && token.trim()) {
    return new Client({ token });
  }

  // Return a mock if not configured
  const mockClient: any = {
    token: "placeholder",
    publishJSON: async () => {
      console.warn("QStash is not configured. QStash operations will be ignored.");
      return { messageId: "mock-message-id" };
    },
    publish: async () => {
      console.warn("QStash is not configured. QStash operations will be ignored.");
      return { messageId: "mock-message-id" };
    },
  };

  return mockClient;
}

// we're using Upstash's Receiver to verify the request signature
export const receiver = new Receiver({
  currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY || "",
  nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY || "",
});

export const qstash = createQStashClient(process.env.QSTASH_TOKEN);
