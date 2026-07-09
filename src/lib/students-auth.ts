import {
  decodeJwtPayload,
  getAccessToken,
  rolesFromPayload,
  startLogin,
} from "./auth";

const ADMIN_ROLES = new Set(["Teacher", "Admin"]);

export function isLoggedIn(): boolean {
  return Boolean(getAccessToken());
}

export function getCurrentRoles(): string[] {
  const token = getAccessToken();
  if (!token) return [];
  return rolesFromPayload(decodeJwtPayload(token));
}

export function isAdminOrTeacher(): boolean {
  return getCurrentRoles().some((role) => ADMIN_ROLES.has(role));
}

export async function requireLogin(returnPath?: string): Promise<boolean> {
  if (isLoggedIn()) return true;

  const path = returnPath ?? window.location.pathname + window.location.search;
  sessionStorage.setItem("mercantec_auth_return", path);

  try {
    await startLogin();
  } catch (err) {
    alert(err instanceof Error ? err.message : "Login fejlede");
  }

  return false;
}

export function requireAdminOrTeacher(): boolean {
  if (!isLoggedIn()) return false;
  return isAdminOrTeacher();
}
