import { OpenAI } from "openai";

/**
 * Creates a resilient OpenAI client that doesn't crash on initialization when env vars are missing.
 */
function createOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;

  if (apiKey && apiKey !== "placeholder") {
    return new OpenAI({ apiKey });
  }

  // Return a mock if not configured
  // Provide basic properties for library compatibility
  const mockClient = {
    apiKey: "placeholder",
    vectorStores: {
      retrieve: async () => {
        throw new Error("OpenAI is not configured. Please set OPENAI_API_KEY.");
      },
    },
  };

  return new Proxy(mockClient as any, {
    get(target, prop) {
      if (prop in target) {
        return (target as any)[prop];
      }
      return () => {
        throw new Error("OpenAI is not configured. Please set OPENAI_API_KEY.");
      };
    },
  });
}

export const openai = createOpenAIClient();
