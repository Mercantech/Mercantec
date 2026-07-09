const ROLE_CLAIM =
  "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";

export interface JwtPayload {
  sub?: string;
  name?: string;
  email?: string;
  login_method?: string;
  role?: string | string[];
  iss?: string;
  aud?: string | string[];
  exp?: number;
  iat?: number;
  [key: string]: unknown;
}

function b64UrlToUtf8(segment: string): string {
  let normalized = segment.replace(/-/g, "+").replace(/_/g, "/");
  const pad = normalized.length % 4;
  if (pad) normalized += "=".repeat(4 - pad);
  const binary = atob(normalized);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

export function decodeJwtPayload(accessToken: string): JwtPayload | null {
  if (!accessToken) return null;
  const parts = accessToken.split(".");
  if (parts.length < 2) return null;
  try {
    return JSON.parse(b64UrlToUtf8(parts[1])) as JwtPayload;
  } catch {
    return null;
  }
}

export function jwtExpired(payload: JwtPayload | null): boolean {
  if (!payload?.exp) return false;
  return payload.exp * 1000 < Date.now();
}

export function rolesFromPayload(payload: JwtPayload | null): string[] {
  if (!payload) return [];
  const roleUri = payload[ROLE_CLAIM];
  if (Array.isArray(roleUri)) return roleUri.filter(Boolean) as string[];
  if (typeof roleUri === "string" && roleUri) return [roleUri];
  const role = payload.role;
  if (Array.isArray(role)) return role.filter(Boolean) as string[];
  if (typeof role === "string" && role) return [role];
  return [];
}

export function loginMethodLabel(method?: string): string {
  if (!method) return "—";
  const labels: Record<string, string> = {
    password: "E-mail og adgangskode",
    passkey: "Passkey",
    google: "Google",
    github: "GitHub",
    discord: "Discord",
    microsoft: "Microsoft",
    "microsoft-work": "Microsoft 365",
    "microsoft-school": "Microsoft skolemail",
  };
  return labels[method] ?? method;
}

export function maskEmail(email?: string): string {
  if (!email) return "—";
  const at = email.lastIndexOf("@");
  if (at <= 0) return "**";
  return `**@${email.slice(at + 1)}`;
}
