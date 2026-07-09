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

function isMercantecHost(hostname: string): boolean {
  return hostname === "mercantec.tech" || hostname.endsWith(".mercantec.tech");
}

/**
 * Offentlig site-origin til OAuth, links og same-origin API-proxy.
 * Bruger aldrig intern Docker-port (4040) på mercantec.tech.
 */
export function getSiteOrigin(): string {
  const configured = import.meta.env.PUBLIC_SITE_URL as string | undefined;

  if (typeof window === "undefined") {
    return (configured ?? "https://mercantec.tech").replace(/\/$/, "");
  }

  if (isLocalDevHost(window.location.hostname)) {
    return window.location.origin;
  }

  if (configured?.trim()) {
    return configured.replace(/\/$/, "");
  }

  if (isMercantecHost(window.location.hostname)) {
    return `https://${window.location.hostname}`;
  }

  return window.location.origin;
}

/** Redirect fra intern host-port (fx :4040) til offentlig HTTPS-URL. */
export function redirectIfInternalPort(): void {
  if (typeof window === "undefined") return;

  const { hostname, port, protocol, pathname, search, hash } = window.location;
  const onInternalPort =
    isMercantecHost(hostname) && port === "4040" && protocol.startsWith("http");

  if (onInternalPort) {
    window.location.replace(`https://${hostname}${pathname}${search}${hash}`);
  }
}

export function getRedirectUri(): string {
  return `${getSiteOrigin()}/auth/callback`;
}

/** Token-proxy på offentlig origin — undgår :4040 i URL. */
export function getTokenEndpoint(): string {
  return `${getSiteOrigin()}/api/oauth/token`;
}
