const DEFAULT_PUBLIC_ORIGIN = "https://mercantec.tech";

export function isMercantecHost(hostname: string): boolean {
  return hostname === "mercantec.tech" || hostname.endsWith(".mercantec.tech");
}

/** Fjerner intern Docker-port og tvinger HTTPS på mercantec-domæner. */
export function sanitizePublicOrigin(origin: string, hostname?: string): string {
  const trimmed = origin.trim().replace(/\/$/, "");
  if (!trimmed) return DEFAULT_PUBLIC_ORIGIN;

  try {
    const url = new URL(trimmed);
    const host = hostname && isMercantecHost(hostname) ? hostname : url.hostname;

    if (isMercantecHost(host)) {
      return `https://${host}`;
    }

    return `${url.protocol}//${url.host}`;
  } catch {
    return DEFAULT_PUBLIC_ORIGIN;
  }
}

export function getCanonicalSiteOrigin(hostname: string): string | undefined {
  if (!isMercantecHost(hostname)) return undefined;
  return `https://${hostname}`;
}

/** Offentlig base-URL (build-time) — uden intern Docker-port. */
export function getPublicSiteUrl(): string {
  const raw = (import.meta.env.PUBLIC_SITE_URL as string | undefined)?.trim();
  return sanitizePublicOrigin(raw || DEFAULT_PUBLIC_ORIGIN);
}

/** Absolut sti på mercantec.tech (til links i HTML). */
export function publicPath(path: string): string {
  const base = getPublicSiteUrl();
  if (path.startsWith("/")) return `${base}${path}`;
  return `${base}/${path}`;
}
