const ACCESS_TOKEN_KEY = "mercantec_access_token";
const REFRESH_TOKEN_KEY = "mercantec_refresh_token";
const PKCE_VERIFIER_KEY = "pkce_verifier";
const OAUTH_STATE_KEY = "oauth_state";

export function getAccessToken(): string | null {
  try {
    return sessionStorage.getItem(ACCESS_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function getRefreshToken(): string | null {
  try {
    return sessionStorage.getItem(REFRESH_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setTokens(accessToken: string, refreshToken?: string): void {
  sessionStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  if (refreshToken) {
    sessionStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }
}

export function clearTokens(): void {
  sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  sessionStorage.removeItem(REFRESH_TOKEN_KEY);
  sessionStorage.removeItem(PKCE_VERIFIER_KEY);
  sessionStorage.removeItem(OAUTH_STATE_KEY);
}

export function setPkceSession(verifier: string, state: string): void {
  sessionStorage.setItem(PKCE_VERIFIER_KEY, verifier);
  sessionStorage.setItem(OAUTH_STATE_KEY, state);
}

export function getPkceVerifier(): string | null {
  return sessionStorage.getItem(PKCE_VERIFIER_KEY);
}

export function getOAuthState(): string | null {
  return sessionStorage.getItem(OAUTH_STATE_KEY);
}

export function clearPkceSession(): void {
  sessionStorage.removeItem(PKCE_VERIFIER_KEY);
  sessionStorage.removeItem(OAUTH_STATE_KEY);
}
