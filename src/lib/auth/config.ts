export interface AuthConfig {
  authBaseUrl: string;
  clientId: string;
  expectedIssuer: string;
  expectedAudience: string;
}

export function getAuthConfig(): AuthConfig {
  return {
    authBaseUrl:
      import.meta.env.PUBLIC_AUTH_BASE_URL ?? "https://auth.mercantec.tech",
    clientId: import.meta.env.PUBLIC_AUTH_CLIENT_ID ?? "demo",
    expectedIssuer:
      import.meta.env.PUBLIC_AUTH_ISSUER ?? "https://auth.mercantec.tech",
    expectedAudience:
      import.meta.env.PUBLIC_AUTH_AUDIENCE ?? "mercantec-apps",
  };
}

export function getRedirectUri(): string {
  if (typeof window === "undefined") return "";
  return `${window.location.origin}/auth/callback`;
}
