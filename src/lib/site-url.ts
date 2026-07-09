/** Offentlig base-URL (build-time) — uden intern Docker-port. */
export function getPublicSiteUrl(): string {
  return (import.meta.env.PUBLIC_SITE_URL ?? "https://mercantec.tech").replace(/\/$/, "");
}

/** Absolut sti på mercantec.tech (til links i HTML). */
export function publicPath(path: string): string {
  const base = getPublicSiteUrl();
  if (path.startsWith("/")) return `${base}${path}`;
  return `${base}/${path}`;
}
