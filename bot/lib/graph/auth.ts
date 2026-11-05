export type GraphAuthConfig = {
  clientId: string;
  clientSecret: string;
  tenantId: string;
  userId: string;
};

export function isGraphConfigured(): boolean {
  return Boolean(
    process.env.MICROSOFT_CLIENT_ID &&
      process.env.MICROSOFT_CLIENT_SECRET &&
      process.env.MICROSOFT_TENANT_ID,
  );
}

export function getGraphAuthConfig(): GraphAuthConfig | null {
  if (!isGraphConfigured()) return null;
  return {
    clientId: process.env.MICROSOFT_CLIENT_ID!,
    clientSecret: process.env.MICROSOFT_CLIENT_SECRET!,
    tenantId: process.env.MICROSOFT_TENANT_ID!,
    userId: process.env.MICROSOFT_USER_ID || "me",
  };
}

let cachedToken: { accessToken: string; expiresAtMs: number } | null = null;

export async function getGraphAccessToken(): Promise<string> {
  const config = getGraphAuthConfig();
  if (!config) {
    throw new Error("Microsoft Graph is not configured");
  }

  const now = Date.now();
  if (cachedToken && cachedToken.expiresAtMs > now + 60_000) {
    return cachedToken.accessToken;
  }

  const body = new URLSearchParams({
    client_id: config.clientId,
    client_secret: config.clientSecret,
    scope: "https://graph.microsoft.com/.default",
    grant_type: "client_credentials",
  });

  const res = await fetch(
    `https://login.microsoftonline.com/${config.tenantId}/oauth2/v2.0/token`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    },
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Graph token request failed (${res.status}): ${text}`);
  }

  const json = (await res.json()) as {
    access_token: string;
    expires_in: number;
  };

  cachedToken = {
    accessToken: json.access_token,
    expiresAtMs: now + json.expires_in * 1000,
  };
  return cachedToken.accessToken;
}
