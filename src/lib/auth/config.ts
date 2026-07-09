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

function isLocalDevHost(hostname: string): boolean {
  return hostname === "localhost" || hostname === "127.0.0.1";
}

/** Offentlig site-origin til OAuth redirect — uden intern host-port. */
export function getSiteOrigin(): string {
  const configured = import.meta.env.PUBLIC_SITE_URL as string | undefined;

  if (typeof window === "undefined") {
    return (configured ?? "https://mercantec.tech").replace(/\/$/, "");
  }

  if (isLocalDevHost(window.location.hostname)) {
    return window.location.origin;
  }

  if (configured) {
    return configured.replace(/\/$/, "");
  }

  if (
    window.location.hostname === "mercantec.tech" ||
    window.location.hostname.endsWith(".mercantec.tech")
  ) {
    return "https://mercantec.tech";
  }

  return window.location.origin;
}

export function getRedirectUri(): string {
  return `${getSiteOrigin()}/auth/callback`;
}

/** Same-origin proxy (/api/oauth/token) undgår CORS fra browseren. */
export function getTokenEndpoint(): string {
  if (typeof window !== "undefined") {
    return `${window.location.origin}/api/oauth/token`;
  }
  const { authBaseUrl } = getAuthConfig();
  return `${authBaseUrl.replace(/\/$/, "")}/oauth/token`;
}
