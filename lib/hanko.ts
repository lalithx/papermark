import { tenant } from "@teamhanko/passkeys-next-auth-provider";

const hanko = tenant({
  apiKey: process.env.HANKO_API_KEY || "placeholder",
  tenantId: process.env.NEXT_PUBLIC_HANKO_TENANT_ID || "placeholder",
});

export default hanko;
