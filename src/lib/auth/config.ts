import {
  getCanonicalSiteOrigin,
  isMercantecHost,
  sanitizePublicOrigin,
} from "../site-url";

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

declare global {
  interface Window {
    /** Sat af /site-origin.js ved container-start (runtime env). */
    __MERCANTEC_SITE_ORIGIN__?: string;
  }
}

function configuredSiteOrigin(): string | undefined {
  const fromEnv = import.meta.env.PUBLIC_SITE_URL as string | undefined;
  return fromEnv?.trim() ? fromEnv.trim() : undefined;
}

/**
 * Offentlig site-origin til OAuth, links og same-origin API-proxy.
 * Bruger aldrig intern Docker-port (4040) på mercantec.tech.
 */
export function getSiteOrigin(): string {
  if (typeof window !== "undefined") {
    const { hostname } = window.location;
    const canonical = getCanonicalSiteOrigin(hostname);
    if (canonical) return canonical;

    const runtime = window.__MERCANTEC_SITE_ORIGIN__?.trim();
    if (runtime) return sanitizePublicOrigin(runtime, hostname);

    if (isLocalDevHost(hostname)) {
      return window.location.origin;
    }
  }

  return sanitizePublicOrigin(configuredSiteOrigin() ?? "https://mercantec.tech");
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
