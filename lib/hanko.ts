import { tenant } from "@teamhanko/passkeys-next-auth-provider";

/**
 * Creates a resilient Hanko client/tenant configuration.
 */
function createHankoClient() {
  const apiKey = process.env.HANKO_API_KEY;
  const tenantId = process.env.NEXT_PUBLIC_HANKO_TENANT_ID;

  // Real initialization
  if (apiKey && tenantId && apiKey !== "placeholder") {
    return tenant({
      apiKey,
      tenantId,
    });
  }

  // Fallback: Return a fake object with placeholder values to prevent 
  // library initialization from crashing (e.g. PasskeyProvider in next-auth).
  const mockTenant = {
    apiKey: "placeholder",
    tenantId: "placeholder",
    // Adding common properties that libraries might look for
    issuer: "https://passkeys.hanko.io/placeholder",
  };

  return new Proxy(mockTenant as any, {
    get(target, prop) {
      if (prop in target) {
        return (target as any)[prop];
      }
      // For anything else (methods), return a function that throws a clear runtime error
      return () => {
        throw new Error(
          "Hanko Passkeys are not configured. Please set HANKO_API_KEY and NEXT_PUBLIC_HANKO_TENANT_ID.",
        );
      };
    },
  });
}

const hanko = createHankoClient();

export default hanko;
