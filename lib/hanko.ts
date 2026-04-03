import { tenant } from "@teamhanko/passkeys-next-auth-provider";

/**
 * Creates a resilient Hanko client/tenant configuration.
 */
function createHankoClient() {
  const apiKey = process.env.HANKO_API_KEY;
  const tenantId = process.env.NEXT_PUBLIC_HANKO_TENANT_ID;

  // Real initialization
  if (apiKey && tenantId && apiKey !== "placeholder") {
    // Basic validation to avoid passing empty strings
    if (apiKey.trim() && tenantId.trim()) {
      return tenant({
        apiKey,
        tenantId,
      });
    }
  }

  // Fallback: Return a plain object with placeholder values.
  // Using both 'tenantId' and 'id' as some versions of the library 
  // might expect one or the other to build the issuer URL.
  const thrower = () => {
    throw new Error(
      "Hanko Passkeys are not configured. Please set HANKO_API_KEY and NEXT_PUBLIC_HANKO_TENANT_ID.",
    );
  };

  const mockTenant: any = {
    apiKey: "placeholder",
    tenantId: "placeholder",
    id: "placeholder",
    issuer: "https://passkeys.hanko.io/placeholder",
    baseUrl: "https://passkeys.hanko.io/placeholder",
    registration: {
      initialize: thrower,
      finalize: thrower,
    },
  };

  return mockTenant;
}

const hanko = createHankoClient();

export default hanko;
